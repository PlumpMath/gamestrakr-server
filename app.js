const server = require('./config/initializers/server.js'),
  async = require('async');

async.series([
  function startServer(callback){
    server(callback);
  }
]);

