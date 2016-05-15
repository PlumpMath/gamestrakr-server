const express = require('express'),
  router = express.Router(),
  passportTwitter = require('../auth/twitter'),
  passportFacebook = require('../auth/facebook');

module.exports = function(){
  router.get('/twitter', passportTwitter.authenticate('twitter'));

  router.get('/twitter/callback',
             passportTwitter.authenticate('twitter', {
               failureRedirect: '/auth/login'
             }),

             function(req, res) {
               // Successful authentication
             res.json(req.user);
             });

  router.get('/facebook', passportFacebook.authenticate('facebook'));

  router.get('/facebook/callback',
             passportFacebook.authenticate('facebook', {
               failureRedirect: '/auth/login'
             }),

             function(req, res) {
               // Successful authentication
             res.json(req.user);
             });

  return router;
};
