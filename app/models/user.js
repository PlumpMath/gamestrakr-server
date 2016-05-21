const mongoose = require('mongoose'),
  GameSchema = require('./user_game').UserGameSchema,
  _ = require('lodash');

const UserSchema = new mongoose.Schema({
  name: {type: String, required: true},
  twitterId: String,
  facebookId: String,
  games: [GameSchema]
});

UserSchema.methods.addGame = function(game, cb){
  const existingGame = _.find(this.games, {name: game.name})
  if (existingGame){
    const updatedGame = _.merge(existingGame, game);
    this.games[existingGame] = updatedGame;
  } else {
    this.games.push(game);
  }
};

UserSchema.methods.addGames = function(games, cb){
  games.forEach(function(game){
    this.addGame(game);
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = {UserSchema, User};
