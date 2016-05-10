const express = require("express"),
 path = require("path"),
 bodyParser = require("body-parser"),
 mongodb = require("mongodb");
 routes = require("../../app/routes/index");

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

  routes(app, db);

  // Initialize the app.
  const server = app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
    const port = server.address().port;
    console.log("App now running on port", port);
  });
};
