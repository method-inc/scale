var path = require('path');

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

