const express = require("express"),
  router = express.Router();

router.get('/', function(req, res){
  res.send('Games index page')
});

module.exports = router;
