var mongoose = require("mongoose");
var db = mongoose.connection;
require('dotenv').load();

module.exports = function(callback){
  mongoose.connect(process.env.MONGODB_URI);

  db.on('error', function(){ 'db connection error' });
  db.once('open', function(){
    console.log("Database connection ready");
    callback(null, db);
  })
};

