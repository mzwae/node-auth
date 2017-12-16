module.exports = function (app, passport) {

  //Home page
  app.get('/', function (req, res) {
    res.render('index.ejs'); //load the index.ejs file
  });

  //Login
  app.get('/login', function (req, res) {

    //render the page and pass in any flash data if it exists
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  //Signup
  app.get('/signup', function (req, res) {

    //render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  //process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  //process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', //redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if no error
    failureFlash: true // allow flash messages
  }));

  /*Profile is accessible only if the user is loggedin; we'll use route middleware to verify this - the isLoggedIn function*/
  app.get('/profile', isLoggedIn, function (req, res) {

    res.render('profile.ejs', {
      user: req.user //get user out of session and pass to template
    });
  });

  //Logout
  app.get('/logout', function (req, res) {
    req.logout(); // provided by passport
    res.redirect('/'); //provided by Express
  });


  /****FACEBOOK ROUTES****/
  //route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));

  //handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  /****TWITTER ROUTES****/
  //route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'));

  //handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  /****GOOGLE ROUTES****/
  //send to google to do authentication
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  //handle the callback after google has authenticated the user
  app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  /******************LINKING ACCOUNTS ROUTES***************************/

  /**********************LOCAL************************/
  app.get('/connect/local', function (req, res) {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    });
  });

  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', //redirect to the secure profile section
    failureRedirect: '/connect/local', //redirect back to the signup page if error
    failureFlash: true //allow flash messages
  }));

  /**********************FACEBOOK********************/
  //send to facebook to do the authentication
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: ['public_profile', 'email']
  }));

  //handle the callback after facebook has authorized the user
  app.get('/connect/facebook/callback', passport.authorize('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  /**********************TWITTER*********************/
  //send to twitter to do the authentication
  app.get('/connect/twitter', passport.authorize('twitter', {
    scope: 'email'
  }));

  //handle the callback after twitter has authorized the user
  app.get('/connect/twitter/callback', passport.authorize('twitter', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

  /**********************GOOGLE**********************/
  //send to google to do authentication
  app.get('/connect/google', passport.authorize('google', {
    scope: ['profile', 'email']
  }));

  //handle the callback after google has authorized the user
  app.get('/connect/google/callback', passport.authorize('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));


  /******************UNLINKING ACCOUNTS ROUTES***************************/
  /*
  1. For social accounts, remove token only in case the user changes their mind.
  2. For local accounts, remove email and password.
  3. User account will stay active in case they want to reconnect in the future.
  */

  //local--------------------------------------
  app.get('/unlink/local', function (req, res) {
    var user = req.user;

    /*   user.updateOne({}, {$unset: {local: ""}});
       db.movieDetails.updateMany({rated: null}, {$unset: {rated: ""}})*/
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  //facebook-----------------------------------
  app.get('/unlink/facebook', function (req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  //twitter------------------------------------
  app.get('/unlink/twitter', function (req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  //google-------------------------------------
  app.get('/unlink/google', function (req, res) {
    var user = req.user;
    user.google.token = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });
};
//Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  //if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // if they aren't rediret them to the home page
  res.redirect('/');
}