var util = require('../../lib/mongoose-util'),
    mongoose = require('mongoose'),
    _ = require("underscore");

module.exports = function(app) {
  var assets = {
    images: [{
      location: {type:String},
      timing: {start:{type:Number}, end:{type:Number}}
    }],
    css: [{
      location: {type:String},
      timing: {start:{type:Number}, end:{type:Number}}
    }],
    scripts: [{
      location: {type:String},
      timing: {start:{type:Number}, end:{type:Number}}
    }]
  };

  var timing = {
    start: { type:Number },
    end:   { type:Number }
  };

  var testResult = new mongoose.Schema({
    parentTest:     { type: mongoose.Schema.ObjectId, ref: 'loadtest', required:true },
    iteration:      { type: Number},
    assets:         assets,
    timing:         timing,
    batch:          { type: Number },
    ramp:           { type: Number }
  }, {strict:true});


  testResult.statics.insertNew = function(obj, callback) {

    console.log(obj);

    var result = new app.models.testResult();
    result.assets = obj.assets;

    result.parentTest = obj.testId;
    result.batch = obj.batchNumber;
    result.iteration = obj.iteration;
    result.timing = obj.timing;

    result.save(callback);
  };

  return mongoose.model('testResult', testResult);

};
