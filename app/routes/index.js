const express = require("express"),
 games = require("./games");

module.exports = function(app, db){
  app.use('/games', games(db));
};
