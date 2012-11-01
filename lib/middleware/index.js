var logger = require('./logger');
var delivery = require('./delivery');
var assets = require('./assets');
var bodies = require('./bodies');
var locals = require('./locals');
var router = require('./router');

module.exports = function(app) {
  logger(app);
  delivery(app);
  assets(app);
  bodies(app);
  locals(app);
  router(app);
};