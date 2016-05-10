const express = require("express"),
  router = express.Router(),
  GAMES_COLLECTION = "games";

module.exports = function(db){

  router.get('/', function(req, res){
    db.collection(GAMES_COLLECTION).find({}).toArray(function(err, docs) {
      res.status(200).json(docs);
    });
  });

  return router;
};

