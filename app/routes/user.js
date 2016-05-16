const express = require('express'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware');

module.exports = function(){
  router.get('/', authenticate, function(req, res){
    return res.status(200).send({message: 'user info'});
  });

  return router;
};
