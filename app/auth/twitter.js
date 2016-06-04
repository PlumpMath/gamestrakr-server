const passport = require('passport'),
  TwitterStrategy = require('passport-twitter'),
  User = require('../models/user').User;

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
},
function (token, tokenSecret, profile, done) {
  const searchQuery = {
    name: profile.displayName,
  };

  const updates = {
    name: profile.displayName,
    twitterId: profile.id,
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
