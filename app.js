const server = require('./config/initializers/server'),
  db = require('./config/initializers/database'),
  async = require('async');

require('dotenv').load();

async.waterfall([
  function initializerDBConnection(callback) {
    db(callback)
  },
  function startServer(db, callback) {
    server(db);
  }
], function(err, result) {
  if (err) {console.log('error: ', err)}
  // else {console.log(result)}
});

