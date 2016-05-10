const express = require("express"),
 path = require("path"),
 bodyParser = require("body-parser"),
 mongodb = require("mongodb");
 routes = require("../../app/routes/index");

const env = process.env;

module.exports = function(cb){
  const app = express();
  app.use(express.static(__dirname + "/public"));
  app.use(bodyParser.json());

  routes(app);

  // Initialize the app.
  const server = app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function () {
    const port = server.address().port;
    console.log("App now running on port", port);
  });

  if (cb){
    return cb();
  }
};
