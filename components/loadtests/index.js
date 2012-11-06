var path = require('path'),
    Socket = require('net').Socket,
    _ = require("underscore");

module.exports = function(app) {

  app.components_with_public.push('loadtests');

  var loadTest = require('./loadtestModel')(app);
  var testResult = require('./testResultModel')(app);
  app.models.loadTest = loadTest;
  app.models.testResult = testResult;

  app.get('/test/new', app.user.loggedIn, [
    render('new')
  ]);

  app.post('/test', app.user.loggedIn, [
    createTest,
    redirect('/dashboard')
  ]);

  app.get('/test/:id', app.user.loggedIn, [
    getTest,
    render('show')
  ]);

  app.get('/test/:id/run', app.user.loggedIn, [
    getTest,
    runTest
  ]);

  app.get('/test/:id/results', app.user.loggedIn, [
    getResults
  ]);

  function getTest(req,res,next) {
    loadTest.findById(req.params.id, function(err, result) {
      res.locals.test = result;
      // result.batches = 0;
      // result.save(next);
      return next(err);
    });
  }

  function createTest(req,res,next) {
    var params = req.body;
    params.owner = req.session.user && req.session.user._id;
    new loadTest(params).save(next);
  }

  function runTest(req, res) {
    var test = res.locals.test;

    if(!test.batches) test.batches = 1;
    else test.batches = test.batches + 1;
    startTest(test);

    test.save(res.tful);
  }

  function startTest(test) {
    var socket = new Socket();
    socket.connect(3333);
    socket.on('connect', function() {
      console.log('Connected to Payload server.');
      socket.write(JSON.stringify(
        {
          location: test.url,
          asset_types: (test.assets.length > 0) ? test.assets : ['images', 'css', 'scripts'],
          method:test.testType,
          iterations:100
        }
      ));
    });

    socket.on('data', function(data) {
      console.log('Receiving Data', test);
      var returnData = JSON.parse(data);

      if(test.testType === 'flood') addFromFlood(returnData, test);
      else addFromRamp(returnData, test);

    });
  }

  function addFromFlood(data, test) {
    _.each(data.results, function(d) {
      d.testId = test._id;
      d.batchNumber = test.batches;
      testResult.insertNew(d, function(err) {
        if(err) console.log(err);
        return false;
      });
    });
  }

  function addFromRamp(data) {
    // TODO -------
    _.each(data.results, function(d) {
      d.testId = data.testId;
      d.batchNumber = data.batchNumber;
      testResult.insertNew(d, function(err) {
        if(err) console.log(err);
        return false;
      });
    });
  }



  function getResults(req, res) {
    var test = req.params['id'];
    testResult.find({'parentTest':test}, res.tful);
  }

};


function render(view) {
  return function(req,res) {
    return res.render(path.join(__dirname, view));
  };
}

function redirect(location) {
  return function(req,res) {
    return res.redirect(location);
  };
}

