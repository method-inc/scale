// Connect to mongodb

var mongoose = require('mongoose');

module.exports = function(app) {
  
  var connect_string = (process.env.NODE_ENV == "test") ? app.config.mongo.test : app.config.mongo.db ;

  console.log("connecting to:", connect_string);

  mongoose.connect(connect_string, function(err) {
    if (err) throw new Error(err.message);
  });
};