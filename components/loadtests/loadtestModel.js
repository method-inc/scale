var util = require('../../lib/mongoose-util'),
    mongoose = require('mongoose');

module.exports = function(app) {

  var LoadTest = new mongoose.Schema({
    owner           : { type: mongoose.Schema.ObjectId, ref: 'User', required:true },
    name            : { type: String, trim: true, required:true },
    url             : { type: String, trim: true, required:true },
    numUsers        : { type: Number, trim: true, required:true },
    resouces        : [{ type: String, trim: true }],
    description     : { type: String, trim: true },
    batches         : { type: Number, 'default':0 },
    testType        : { type: String, 'enum':['flood', 'ramp'], 'default':'flood' }
  }, {strict:true});

  // Plugins

  LoadTest.plugin(util.plugin.timestamps);


  LoadTest.pre('save', function(next) {
    if(!this.isNew) return next();

    // put in code here that will create test jobs on remote apps

    return next();
  });


  // Export

  return mongoose.model('LoadTest', LoadTest);

};