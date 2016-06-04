const passport = require('passport'),
  FacebookStrategy = require('passport-facebook'),
  User = require('../models/user').User;

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CONSUMER_KEY,
  clientSecret: process.env.FACEBOOK_CONSUMER_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
},
function (token, tokenSecret, profile, done) {
  const searchQuery = {
    name: profile.displayName,
  };

  const updates = {
    name: profile.displayName,
    email: profile.email,
    facebookId: profile.id,
  };

  const options = {
    upsert: true,
  };

  User.findOneAndUpdate(searchQuery, updates, options, function (err, user) {
    if (err) {
      return done(err);
    } else {
      return done(null, user);
    }
  });
}));

module.exports = passport;
