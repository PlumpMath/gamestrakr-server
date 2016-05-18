const mongoose = require('mongoose'),
  GameSchema = require('./user_game').UserGameSchema;

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  twitterId: String,
  facebookId: String,
  games: [GameSchema]
});

const User = mongoose.model('User', UserSchema);

module.exports = {UserSchema, User};
