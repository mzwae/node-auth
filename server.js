//set up -------------------
require('dotenv').load();
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');


var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
require('./config/passport')(passport);//pass passport for configuration


//configuration------------------

var dbURI = 'mongodb://localhost/node-auth';
var databaseType = "LOCAL";
if (process.env.NODE_ENV === 'production') {
  databaseType = "REMOTE";
  dbURI = process.env.dbURI;
}

mongoose.connect(dbURI);

console.log("App server successfully connected to", databaseType, "Database server!");




//set up our express application-------------------
app.use(morgan('dev'));//log every request to the console
app.use(cookieParser());//read cookies - needed for auth
app.use(bodyParser.json());//get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'app_client')));
app.set('view engine', 'ejs');// set up ejs for templating

//required for passport---------------------------
app.use(session({
  secret: 'ilovescotchscotchyscotchscotch', // session secret
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());//persist login sessions
app.use(flash());//use connet-flash for flash messages stored in session

//routes-------------------------------
require('./app/routes.js')(app, passport);//load our routes and pass in our app and fully configured passport


//launch-----------------------
//app.listen(port, function(){
//  console.log('node-auth server listening on port ', port);
//});

module.exports = app;




