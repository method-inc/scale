function mainTest(options) {
  var self = this;
  // console.log(options);
  this.id = options._id;
  this.name = ko.observable(options.name);
  this.batches = ko.observable(options.batches);
  this.users = ko.observable(options.numUsers);
  this.results = ko.observableArray([]);

  // if batches is greater than 0, then tests have been ran so check for results
  if(this.batches() > 0) this.getResults(self);

  this.getResultsTimeout = 2000;

  this.numUsers = ko.computed(function() {
    return 'Number of users: ' + options.numUsers;
  }, this);

  this.url = ko.computed(function() {
    return 'URL: ' + options.url;
  }, this);

  this.iterationCount = ko.computed(function() {
    return this.results().length;
  }, this);

  this.iterations = ko.computed(function() {
    return this.results().length + ' out of '+this.users()+' iterations complete.';
  }, this);

  this.imageAssets = ko.computed(function() {
    if(this.results().length > 0) return this.results()[0].images().length;
    else return 0;
  }, this);

  this.cssAssets = ko.computed(function() {
    if(this.results().length > 0) return this.results()[0].csss().length;
    else return 0;
  }, this);

  this.scriptAssets = ko.computed(function() {
    if(this.results().length > 0) return this.results()[0].scripts().length;
    else return 0;
  }, this);

  this.completedTimes = {
    images: ko.observable(0),
    csss:ko.observable(0),
    scripts:ko.observable(0)
  };

  this.completedAverages = {
    images:ko.computed(function() {
      if(this.completedTimes.images() > 0) {
        return this.roundNumber(this.completedTimes.images() / (this.results().length || 0));
      } else return 0;}, this),
    csss:ko.computed(function() {
      if(this.completedTimes.csss() > 0) {
        return this.roundNumber(this.completedTimes.csss() / (this.results().length || 0));
      } else return 0;}, this),
    scripts:ko.computed(function() {
      if(this.completedTimes.scripts() > 0) {
        return this.roundNumber(this.completedTimes.scripts() / (this.results().length || 0));
      } else return 0;}, this)
  };


  this.imageAverageTime = ko.computed(function() {
    if(this.completedTimes.images() > 0) {
      // console.log(this.completedTimes.images());
      return this.roundNumber(this.completedTimes.images() / (this.imageAssets() * this.iterationCount())) + ' average each';
    } else return 0;
  }, this);

  this.cssAverageTime = ko.computed(function() {
    if(this.completedTimes.csss() > 0) {
      return this.roundNumber(this.completedTimes.csss() / (this.cssAssets() * this.iterationCount())) + ' average each';
    } else return 0;
  }, this);

  this.scriptAverageTime = ko.computed(function() {
    if(this.completedTimes.scripts() > 0) {
      return this.roundNumber(this.completedTimes.scripts() / (this.scriptAssets() * this.iterationCount())) + ' average each';
    } else return 0;
  }, this);


  this.removeClassForSummary = ko.computed(function() {
    if(this.completedTimes.scripts() > 0 || this.completedTimes.images() > 0 || this.completedTimes.csss() > 0) $('div.resultsSummary').removeClass('noShow');
    return false;
  }, this);
  // $('div.resultsSummary').removeClass('noShow');

}

mainTest.prototype.addToCompletedTime = function(asset, time) {
  if(time < 0) return false;
  this.completedTimes[asset](this.completedTimes[asset]() + time);
};

mainTest.prototype.addResult = function(single) {
  this.results.push(new singleResult(single, this));
};

mainTest.prototype.makeCall = function() {
  var self = this;
  $.ajax({
    url: '/test/'+self.id+'/run',
    type: 'GET',
    success: function(data) {
      if(data.code === 200) {
        console.log('success', data);
        self.batches(data.data.batches);
        if(self.batches() > 0) self.getResults(self);
        alert('Tests have been started');
      }
    },
    error: function(res) {
      console.log('error', res);
    }
  });

};

mainTest.prototype.getResults = function(that) {
  // console.log('checking');
  var self = that;
  $.ajax({
    url: '/test/'+self.id+'/results',
    type: 'get',
    success: function(data) {
      // console.log(data.data.length !== self.results().length);
      if(data.code === 200 && data.data.length !== self.results().length) {
        self.results([]);
        _.each(self.completedTimes, function(i) {return i(0);});
        _.each(data.data, function(d) {self.addResult(d);});
      }

      // periodically check for new results
      setTimeout(function() {
        self.getResults(self);
      }, self.getResultsTimeout);
    }
  });
};

mainTest.prototype.showResults = function() {
  $('div.allResults').toggleClass('show');
  $('div.resultsSummary').toggleClass('hide');
};

mainTest.prototype.getAverage = function(totalTime, asset) {
  return totalTime / asset.length;
};
mainTest.prototype.roundNumber = function(number) {
  return Math.round(number*100)/100;
};

function singleResult(options, container) {
  // console.log(options);
  var self = this;
  this.container = container || {};
  this.images = ko.observableArray([]);
  this.csss = ko.observableArray([]);
  this.scripts = ko.observableArray([]);

  this.completedTimes = {
    images:ko.observable(0),
    csss:ko.observable(0),
    scripts:ko.observable(0)
  };


  this.iteration = ko.computed(function() {
    return 'Iteration number: ' + options.iteration;
  }, this);

  if(options.assets) {
    _.each(options.assets.images, function(i){ self.pushAsset('images', i); });
    _.each(options.assets.css, function(i){ self.pushAsset('csss', i); });
    _.each(options.assets.scripts, function(i){ self.pushAsset('scripts', i); });
  }

  this.imageTimeAverage = ko.computed(function() {
    return this.container.getAverage(this.completedTimes.images(), this.images());
  }, this);

  this.cssTimeAverage = ko.computed(function() {
    return this.container.getAverage(this.completedTimes.csss(), this.csss());
  }, this);

  this.scriptTimeAverage = ko.computed(function() {
    return this.container.getAverage(this.completedTimes.scripts(), this.scripts());
  }, this);

  // this.container.addToCompletedTime('images', this.container.roundNumber(this.imageTimeAverage));
  // this.container.addToCompletedTime('csss', this.container.roundNumber(this.cssTimeAverage));
  // this.container.addToCompletedTime('scripts', this.container.roundNumber(this.scriptTimeAverage));
}

singleResult.prototype.pushAsset = function(asset, i) {
  this[asset].push(new singleAsset(i, asset, this));
};

singleResult.prototype.addToCompletedTime = function(asset, time) {
  if(time < 0) return false;
  this.completedTimes[asset](this.completedTimes[asset]() + time);
};

function singleAsset(options, assetType, container) {

  this.container = container || {};
  this.assetType = assetType;
  this.location = ko.observable(options.location);
  this.start = ko.observable(options.timing.start);
  this.end = ko.observable(options.timing.end);

  this.timeStarted = long_time(this.start());

  this.timeLength = this.end() - this.start();

  // console.log(this.timeLength);

  this.container.container.addToCompletedTime(this.assetType, this.timeLength);

}

