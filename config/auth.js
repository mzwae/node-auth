module.exports = {
  'facebookAuth': {
    'clientID': process.env.facebookCI,
    'clientSecret': process.env.facebookCS,
    'callbackURL': 'http://localhost:3000/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    'profileFields': ['id', 'email', 'name']
  },
  'twitterAuth': {
    'consumerKey': process.env.twitterCK,
    'consumerSecret': process.env.twitterCS,
    'callbackURL': 'http://localhost:3000/auth/twitter/callback'
  },
  'googleAuth': {
    'clientID': process.env.googleCI,
    'clientSecret': process.env.googleCS,
    'callbackURL': 'http://localhost:3000/auth/google/callback'
  }
};