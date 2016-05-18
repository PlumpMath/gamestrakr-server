const express = require('express'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware'),
  User = require('../models/user');

module.exports = function(){
  // router.get('/info', authenticate, function(req, res){
  //   return res.status(200).send({message: 'user info'});
  // });
  //

  return router;
};
