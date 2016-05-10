var mongodb = require("mongodb");
var db;
require('dotenv').load();

module.exports = function(callback){
  // Connect to the database before starting the application server.
  mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
      // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    callback(null, db);
  });
};

