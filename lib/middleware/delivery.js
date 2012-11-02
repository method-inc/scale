var express = require('express');
var restful = require('restfuljs');
var connectTimeout = require('connect-timeout');

module.exports = function(app) {

  // Timeouts
  var timeouts = connectTimeout({
    throwError: true,
    time: app.config.request_timeout
  });

  //app.use(timeouts);                 // request timeouts
  app.use(express.compress());       // gzip
  app.use(restful.response);
};