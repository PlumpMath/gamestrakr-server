const express = require('express'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware'),
  User = require('../models/user').User;

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

  router.post('/games', authenticate, function(req, res){
    User.findByIdAndUpdate(req.decoded.userId, {$addToSet: {games: req.body.game}}, function(err, doc){
      if (err) return res.status(404).json({message: 'Error adding user game'});
      else return res.status(200).json({message: 'Success'});
    });
  });

  return router;
};
