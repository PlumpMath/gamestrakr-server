const express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken'),
  passportTwitter = require('../auth/twitter'),
  passportFacebook = require('../auth/facebook');

function authCallback(req, res){
  const token = jwt.sign(req.user, process.env.JWT_SECRET, {expiresIn: "7d"});

  return res.redirect(`${process.env.CLIENT_URL}/#/auth_success?token=${token}&name=${req.user.name}`);
  // return res.json({
  //   success: true,
  //   message: 'Heres your token!',
  //   token: token
  // });
}

module.exports = function(){
  router.get('/twitter', passportTwitter.authenticate('twitter', {session: false, scope: []}));
  router.get('/twitter/callback',
             passportTwitter.authenticate('twitter', { session: false, failureRedirect: '/auth/failure'}),
             (req, res) => authCallback(req, res));

  router.get('/facebook', passportFacebook.authenticate('facebook', {session: false, scope: []}));
  router.get('/facebook/callback',
             passportFacebook.authenticate('facebook', { session: false, failureRedirect: '/auth/failure' }),
             (req, res) => authCallback(req, res));

  router.get('/failure', function(req, res){
    return res.status(403).json({
      success: false
    });
  });
  return router;
};
