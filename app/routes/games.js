const express = require("express"),
  router = express.Router(),
  GAMES_COLLECTION = "games";

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

module.exports = function(db){

  router.get('/', function(req, res){
    db.collection(GAMES_COLLECTION).find({}).toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get games.");
      } else {
        res.status(200).json(docs);
      }
    });
  });

  router.get('/test', function(req, res){
    res.send('heheheh');
  });

  return router;
}

