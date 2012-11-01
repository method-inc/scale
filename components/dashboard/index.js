var path = require('path');

module.exports = function(app) {

  app.get('/dashboard', app.user.loggedIn, [
    getTests,
    render('dashboard')
  ]);



  function getTests(req,res,next) {
    app.models.loadTest.find(function(err, results) {
      res.locals.tests = results;
      return next(err);
    });
  }

};


function render(view) {
  return function(req,res) {
    res.render(path.join(__dirname, view));
  };
}