//load all the things we need
var LocalStrategy = require('passport-local').Strategy;

//load up the user model
var User = require('../app/models/user');

//expose this function to our app using module.exports
module.exports = function (passport) {

  //required for persistent login sessions

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });


  //Local signup
  passport.use('local-signup',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true //allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {

        //asynchronous
        //User.findOne won't fire unless data is sent back
        process.nextTick(function () {


          //find a user whose email is the same as the one provided by the user
          //we are checking to see whether the user trying to login exists or not
          User.findOne({
            'local.email': email
          }, function (err, user) {


            //if there are any errors , return the error
            if (err) {
              return done(err);
            }

            //Check to see if the user already exists
            if (user) {
              return done(null, false, req.flash('signupMessage', 'SORRY, That email is already used!'));
            } else {
              //if no user with that email, create a new user
              var newUser = new User();

              //set the new user's local credentials
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);

              //save the user to the database
              newUser.save(function (err) {
                if (err) {
                  throw err;
                }
                return done(null, newUser);
              });

            }
          });
        });
      }
    ));




  //Local login
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true //allows us to pass back the entire request to the callback
  }, function (req, email, password, done) {
    User.findOne({
      'local.email': email
    }, function (err, user) {
      //if there are any errors, return the error before anything else
      if (err) {
        return done(err);
      }

      //if no user is found, return the message
      if (!user) {
        //req.flash is the way to set flash data using connect-flash
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      //if the user is found but the password is wrong
      if (!user.validPassword(password)) {
        //create the login message and save to session as flash data
        return done(null, false, req.failureFlash('loginMessage', 'Oops! Wrong password.'));
      }

      //if all is well, return successful user
      return done(null, user);
    });
  }));

};