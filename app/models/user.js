var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: {type: String, required: true},
  twitterId: String,
  facebookId: String
});

module.exports = mongoose.model('users', User)
