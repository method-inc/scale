var express     = require('express');
var path        = require('path');

// Require our base libs
var balance     = require('./lib/balance');
var middleware  = require('./lib/middleware');
var mongoose    = require('./lib/mongoose');
var flash       = require('./lib/flash');
var reload      = require('./lib/reload')();

// Require our components
var users       = require('./components/user');
var dashboard   = require('./components/dashboard');

// add a couple of globals
_ = require('underscore');
async = require('async');

// Expose the app

module.exports = main;

// Decorate express with our components
// Marry the app to its running configuration

function main(config) {
  var app = express();
  app.config = config;

  // define models object
  app.models = {};

  // set home dir
  app.root_dir = path.normalize(__dirname);

  // initialize libs
  flash(app);
  middleware(app);
  mongoose(app);
  reload();

  // initialize components
  users(app);
  dashboard(app);

  return app;
}

// Start listening if the app has been started directly

if (module === require.main) {
  balance(function() {
    var public_config = require('./package.json').publicConfig;
    var private_config = require('../local.config.json');
    var config = _.extend(public_config, private_config);

    var app = main(config);
    app.listen(config.http_port);
    console.log("Listening on", config.http_port);
  });
}