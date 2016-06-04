const mongoose = require('mongoose');

const GameSchema = mongoose.Schema({
  apiDetailUrl: { type: String, required: true },
  type: {
    type: String,
    enum: ['playing', 'planning', 'completed', 'onHold', 'dropped'],
    required: true,
  },
  name: { type: String, required: true },
  image: Object,
	                    deck: String,
	                    description: String,
	                    platforms: Array,
});

const Game = mongoose.model('Game', GameSchema);

module.exports = { GameSchema, Game };
