const express = require('express'),
 path = require('path'),
 bodyParser = require('body-parser'),
 mongodb = require('mongodb'),
 passport = require('passport'),
 session = require('express-session'),
 routes = require('../../app/routes/index');

const env = process.env;

module.exports = function(db){
  const app = express();
  app.use(express.static(__dirname + "/public"));
  app.use(bodyParser.json());

  // Error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: (env.NODE_ENV === 'development' ? err : {})
    });
    next(err);
  });
  app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());

  // allow CORS
  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  routes(app, db);

  // Initialize the app.
  const server = app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
    const port = server.address().port;
    console.log("App now running on port", port);
  });
};
