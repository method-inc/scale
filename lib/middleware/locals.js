var mason = require('mason');
var moment = require('moment');

module.exports = function(app) {

  app.use(function(req, res, next) {
    
    res.locals.current_user = req.session && req.session.user || null;
    res.locals.is_logged_in = (res.locals.current_user !== null);

    next();
  });

  // Asset management
  var assets = {
    file: app.root_dir + '/mason.json',
    modes: app.config.mason_assets,
    prefix: app.config.mason_prefix
  };
  app.locals(mason(assets).locals());


  app.locals({
    moment: moment,
    inspect: function (obj, title) {
      if (!title) title = 'Inspected!';
      return '<div class="debug_output"><h3>'+title+'</h3><pre>'+require('util').inspect(obj, true, 5)+'</pre></div>';
    },

    embed_json: function(obj, name) {
      var escaped = JSON.stringify(obj);
      return "<script> " + name + " = " + escaped + "; </script>";
    },
    
    embed: function(obj, name) {
      return "<script> " + name + " = \"" + obj + "\"; </script>";
    },

    relative_date: function(olderDate) {

      if (typeof olderDate == "string") olderDate = new Date(olderDate);
      newerDate = new Date();

      var milliseconds = newerDate - olderDate;

      var conversions = [
        ["years", 31518720000],
        ["months", 2626560000 /* assumes there are 30.4 days in a month */],
        ["days", 86400000],
        ["hours", 3600000],
        ["minutes", 60000],
        ["seconds", 1000]
      ];

      for (var i = 0; i < conversions.length; i++) {
        var result = Math.floor(milliseconds / conversions[i][1]);
        if (result >= 2) {
          return result + " " + conversions[i][0] + " ago";
        }
      }

      return "1 second ago";
    }

  });

};


