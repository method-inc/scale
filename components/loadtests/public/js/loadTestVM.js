function mainTest(options) {
  var self = this;
  // console.log(options);
  this.id = options._id;
  this.url = options.url;
  this.numUsers = ko.observable(options.numUsers);
  this.name = ko.observable(options.name);
  this.batches = ko.observable(options.batches);

  this.results = ko.observableArray([]);

  // if batches is greater than 0, then tests have been ran so check for results
  if(this.batches() > 0) this.getResults(self);

  console.log(this.batches());

  this.getResultsTimeout = 10000;

  // setTimeout(self.getResults, self.getResultsTimeout);

}

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
      console.log(data.data.length !== self.results().length);
      if(data.code === 200 && data.data.length !== self.results().length) {
        self.results([]);
        _.each(data.data, function(d) {self.addResult(d);});
      }

      // periodically check for new results
      setTimeout(function() {
        self.getResults(self);
      }, self.getResultsTimeout);
    }
  });
};

function singleResult(options, container) {
  console.log(options);
  var self = this;
  this.container = container || {};
  this.images = ko.observableArray([]);
  this.links = ko.observableArray([]);
  this.scripts = ko.observableArray([]);

  this.iteration = ko.computed(function() {
    return 'Iteration number: ' + options.iteration;
  }, this);


  if(options.assets) {
    _.each(options.assets.img, function(i){ self.pushAsset('images', i); });
    _.each(options.assets.link, function(i){ self.pushAsset('links', i); });
    _.each(options.assets.script, function(i){ self.pushAsset('scripts', i); });
  }

}

singleResult.prototype.pushAsset = function(asset, i) {
  this[asset].push(new singleAsset(i, this));
};

function singleAsset(options, container) {
  this.container = container || {};
  this.location = ko.observable(options.location);
  this.start = ko.observable(options.timing.start);
  this.end = ko.observable(options.timing.end);

  this.timeStarted = ko.computed(function() {
    return long_time(this.start());
  }, this);

  this.timeLength = ko.computed(function() {
    return this.end() - this.start();
  }, this);

}





// summary

//  iterations returned of how many started, maybe percentage
//  section for each asset. like array length for each
//  average timing, and total time for each type of asset
