module.exports = {
  'facebookAuth': {
    'clientID': '350401532100530',
    'clientSecret': '3d7e1c2a692deb1ef1b304d2d0210662',
    'callbackURL': 'http://localhost:3000/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    'profileFields': ['id', 'email', 'name']
  },
  'twitterAuth': {
    'consumerKey': 'myConsumerKey',
    'consumerSecret': 'myClientSecret',
    'callbackURL': 'http://localhost:3000/auth/twitter/callback'
  },
  'googleAuth': {
    'clientID': 'mySecretClientID',
    'clientSecret': 'myClientSecret',
    'callbackURL': 'http://localhost:3000/auth/google/callback'
  }
};