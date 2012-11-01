module.exports = function(app) {

  var UserModel = app.models.user;

  return {

    endSession: function(req, res, next) {
      req.session.regenerate(next);
    },

    checkPivotal: function(req, res, next) {
      if (req.session.user.pivotalToken) {
        app.pivotal.listProjects(req.session.user.pivotalToken,  function(err, projects){
          res.locals.pivotalProjects = projects || [];
          return next();
        });
      }
      else {
        res.locals.pivotalProjects = null ;
        return next();
      }
    },

    updateUser: function(req, res, next) {
      if (req.body.new_password) {
        if (req.body.new_password == req.body.new_password2) {
          req.body.password = req.body.new_password;
        }
        else {
          req.flash("The passwords did not match.");
          return next();
        }
      }

      UserModel.findByIdAndUpdate(req.session.user._id, req.body).exec(function(err, user) {
        if (err || !user) {
          req.flash("There was an error updating the user.");
          return next();
        }
        req.session.user = user;
        return next();
      });
    },

    importPivotal: function(req, res, next) {
      app.pivotal.importProject(req.session.user._id, req.params.id, function(err) {
        if (err) {
          console.log("There was an error importing the project: " + err);
          req.flash("There was an error importing the project: " + err);
          return next();
        }
        res.redirect("/dashboard");
      });
    },

    linkPivotal: function(req, res, next) {
      var linkingError = "There was an error linking to this account.";
      app.pivotal.getToken(req.body.pivotal_email, req.body.pivotal_password, function(err, token) {
        if (err || !token) {
          req.flash(linkingError + " Invalid Credentials.");
          return next();
        }

        UserModel.findByIdAndUpdate(req.session.user._id, {pivotalToken:token}).exec(function(err, user){
          if (err || !user) {
            req.flash(linkingError + " Error saving to user.");
            return next();
          }
          req.session.user = user;
          return next();
        });
      });
    },

    unlinkPivotal: function(req, res, next) {
      var linkingError = "There was an error unlinking to this account.";
      UserModel.findByIdAndUpdate(req.session.user._id, {pivotalToken:""}).exec(function(err, user){
        if (err || !user) {
          req.flash(linkingError + " Error saving to user.");
          return next();
        }
        req.session.user = user;
        return next();
      });
    },

    doRegister: function(req, res, next) {
      var user = new UserModel(req.body);
      user.save(function(err) {
        if (err) {
          var err_message = ((err+"").indexOf("duplicate key error") > -1) ? "That email address is already registered." : err;
          req.flash(err_message);
          return res.redirect('/register');
        }
        else return next();
      });
    },


    doSignIn: function(req, res) {
      var creds = {
          email: req.body.email,
          password: req.body.password
        };
      UserModel.authenticate(creds, function(err, user) {
        if (user) {
          req.session.user = user;
          return res.redirect('/dashboard');
        }
        else {
          req.flash('Sorry, that username or password was not found.');
          return res.redirect('/');
        }
      });
    }

  };
};