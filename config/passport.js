//load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


//load up the user model
var User = require('../app/models/user');

//load authentication variables
var configAuth = require('./auth');

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


  /************************************************************/
  /*LOCAL STRATEGY*/
  /***********************************************************/
  //Local signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true //allows us to pass back the entire request to the callback
  }, function (req, email, password, done) {

    //asynchronous
    //User.findOne won't fire unless data is sent back
    process.nextTick(function () {


      //find a user whose email is the same as the one provided by the user
      //we are checking to see whether the user trying to login exists or not
      User.findOne({
          'local.email': email
        },
        function (err, user) {


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
  }));




  //Local login
  passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true //allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
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


  /************************************************************/
  /*FACEBOOK STRATEGY*/
  /***********************************************************/
  passport.use(new FacebookStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL
    },
    function (req, token, refreshToken, profile, done) {
      //asynchronous
      process.nextTick(function () {
        //check if the user is already logged in
        if (!req.user) {
          //find the user in the database based on their id
          User.findOne({
            'facebook.id': profile.id
          }, function (err, user) {
            //if there is an error, stop everything and return
            if (err) {
              return done(err);
            }

            //if the user is found, then log them in
            if (user) {
              return done(null, user); //user found, return that user
            } else {
              //if no user already signed up, create a new user
              var newUser = new User();

              //set all of the facebook information in our user model
              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              //        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.name = profile.displayName;
              //        newUser.facebook.email = profile.emails[0].value || null;

              //save our user to the databse
              newUser.save(function (err) {
                if (err) {
                  throw err;
                }
                //if no errors, return the new user
                return done(null, newUser);
              });
            }
          });
        } else { //if user already exists and logged in, link accounts
          console.log(">>>>>>>>>>>>>>>>>>>>Facebook token:", token);
          var user = req.user; //get the user from the session
          //upadate the current users facebook credentials
          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name = profile.displayName;

          //save the user
          user.save(function (err) {
            if (err) {
              throw err;
            }
            return done(null, user);
          });
        }
      });
    }));

  /************************************************************/
  /*TWITTER STRATEGY*/
  /***********************************************************/
  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL
  }, function (req, token, tokenSecret, profile, done) {
    // make the code asynchronous
    //User.findOne won't fire until we have all our data back from Twitter
    process.nextTick(function () {
      //check if user is already logged in
      if (!req.user) {
        User.findOne({
          'twitter.id': profile.id
        }, function (err, user) {
          //if there is an error, stop everything and return
          if (err) {
            return done(err);
          }

          // if the user is found then log them in 
          if (user) {
            return done(null, user); //user found, return that user
          } else {
            // if there is no user, create them
            var newUser = new User();

            //set all of the user data that we need
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            //save our user into the database
            newUser.save(function (err) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      } else { //if user already exists and logged in, link accounts
        console.log(">>>>>>>>>>>>>>Twitter token:", token);
        var user = req.user; //get the user from the session
        //update the current user's twitter info
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.username = profile.username;
        user.twitter.displayName = profile.displayName;

        //save the user to the database
        user.save(function (err) {
          if (err) {
            throw err;
          }
          return done(null, user);
        });

      }
    });
  }));


  /************************************************************/
  /*GOOGLE STRATEGY*/
  /***********************************************************/

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL
  }, function (req, token, refreshToken, profile, done) {
    //make the code asynchronous
    //User.finOne won't fire until we have all our data back from Google
    process.nextTick(function () {

      //check if the user is already logged in
      if (!req.user) {
        //try to find the user based on their goole id
        User.findOne({
          'google.id': profile.id
        }, function (err, user) {
          if (err) {
            return done(err);
          }

          if (user) {
            //if a user is found, log them in 
            return done(null, user);
          } else {
            //if the user isn't in our database, create a new user 
            var newUser = new User();

            //set all of the relevant information
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value; //pull the first email

            // save the user to the database
            newUser.save(function (err) {
              if (err) {
                throw err;

              }
              return done(null, newUser);
            });
          }
        });
      } else { //if user already exists and is logged in, link accounts
        console.log(">>>>>>>>>>>>>>>>>Google token:", token);
        var user = req.user; //get the user from the session
        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = profile.emails[0].value; //pull the first email

        //save the user
        user.save(function (err) {
          if (err) {
            throw err;
          }
          return done(null, user);
        });

      }
    });


  }));
};