const express = require('express'),
  games = require('./games'),
  auth = require('./auth');

module.exports = function (app, db) {
  app.use('/games', games(db));
  app.use('/auth', auth());
};
