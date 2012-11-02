var path = require('path'),
    Socket = require('net').Socket;

module.exports = function(app) {

  var loadTest = require('./loadtestModel')(app);
  app.models.loadTest = loadTest;

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
  ])

  function getTest(req,res,next) {
    loadTest.findById(req.params.id, function(err, result) {
      res.locals.test = result;
      return next(err);
    });
  }

  function createTest(req,res,next) {
    var params = req.body;
    params.owner = req.session.user && req.session.user._id;
    new loadTest(params).save(next);
  }

  function runTest(req, res) {
    var socket = new Socket(),
        test = res.locals.test;
    socket.connect(3333);
    socket.on('connect', function() {
      console.log('Connected to Payload server.');
      socket.write(JSON.stringify(
        {
          method: 'flood',
          location: test.url,
          asset_types: test.resouces && test.resouces.length ? test.resouces : ['img', 'link', 'script']
        }
      ));
    });
    socket.on('data', function(data) {
      console.log('Results received');
      res.send(JSON.parse(data));
    });
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

