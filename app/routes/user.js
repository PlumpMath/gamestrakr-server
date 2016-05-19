const express = require('express'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware'),
  User = require('../models/user').User
  _ = require('lodash');

function findUser(req, res, next) {
  User.findById(req.decoded.userId, function(err, doc){
    if(err) {
      return res.status(404).json({message: 'Failed to get user.'});
    } else {
      req.user = doc;
      next();
    }
  });
}

module.exports = function(){
  router.get('/games', authenticate, findUser, function(req, res) {
    const games = req.user.games;
    return res.status(200).json({games: games});
  });

  router.post('/games', authenticate, findUser, function(req, res){
    const reqGame = req.body.game;

    User.findById(req.decoded.userId, function(err, doc){
      if(doc && doc.games){
        const existingGame = _.find(doc.games, {name: reqGame.name})
        if (existingGame){
          const updatedGame = _.merge(existingGame, reqGame);
          doc.games[existingGame] = updatedGame;
        } else {
          doc.games.push(reqGame);
        }

        doc.save();
      }
    });
  });

  return router;
};
