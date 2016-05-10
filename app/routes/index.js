const express = require("express"),
 games = require("./games");

module.exports = function(app){
  app.use('/games', games);
};
