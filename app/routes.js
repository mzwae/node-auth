module.exports = function(app, passport){
  
  //Home page
  app.get('/', function(req, res){
    res.render('index.ejs');//load the index.ejs file
  });
  
  //Login
  app.get('/login', function(req, res){
    
    //render the page and pass in any flash data if it exists
    res.render('login.ejs', {message: req.flash('loginMessage')});
  });
  
  //Signup
  app.get('/signup', function(req, res){
    
    //render the page and pass in any flash data if it exists
    res.render('signup.ejs', {message: req.flash('signupMessage')});
  });
  
  //process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  /*Profile is accessible only if the user is loggedin; we'll use route middleware to verify this - the isLoggedIn function*/
  app.get('/profile', isLoggedIn, function(req, res){
    
    res.render('profile.ejs', {
      user: req.user //get user out of session and pass to template
    });
  });
  
  //Logout
  app.get('/logout', function(req, res){
    req.logout();// provided by passport
    res.redirect('/');//provided by Express
  });
  
  //Route middleware to make sure a user is logged in
  function isLoggedIn(req, res, next){
    
    //if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        return next();
        }
    
    // if they aren't rediret them to the home page
    res.redirect('/');
  }
};