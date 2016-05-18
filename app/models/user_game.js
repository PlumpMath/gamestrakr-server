const mongoose = require('mongoose');

const UserGameSchema = mongoose.Schema({
  giantBombUrl: String,
  status: {
    type: String,
    enum: ['playing', 'planning', 'completed', 'on-hold', 'dropped'],
    required: true
  },
  name: {type: String, required: true},
  imageUrl: String
});

const UserGame = mongoose.model('UserGame', UserGameSchema);

module.exports = {UserGameSchema, UserGame};
