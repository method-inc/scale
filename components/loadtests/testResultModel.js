var util = require('../../lib/mongoose-util'),
    mongoose = require('mongoose'),
    _ = require("underscore");

module.exports = function(app) {
  var assets = {
    img: [{
      location: {type:String},
      timing: {start:{type:Number}, end:{type:Number}}
    }],
    link: [{
      location: {type:String},
      timing: {start:{type:Number}, end:{type:Number}}
    }],
    script: [{
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
    batch:          { type: Number }
  }, {strict:true});


  testResult.statics.insertNew = function(obj, callback) {
    var result = new app.models.testResult();
    result.assets = obj.assets;

    // temp
    result.parentTest = '50941cb891f939d249000003';
    result.iteration = obj.iteration;
    result.timing = obj.timing;

    result.save(callback);
  };

  return mongoose.model('testResult', testResult);

};
