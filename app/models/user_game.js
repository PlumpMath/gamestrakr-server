const mongoose = require("mongoose");

const UserGameSchema = mongoose.Schema({
  giantBombId: {type:Number, required: true},
  status: {
    type: String,
    enum: ['playing', 'planning', 'completed', 'on-hold', 'dropped'],
    required: true
  }
});

const UserGame = mongoose.model('UserGame', UserGameSchema);

module.exports = {UserGameSchema, UserGame};
