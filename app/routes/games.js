// TODO: set up user accounts with oauth
// TODO: give user accounts ability to add currently playing
// TODO: cache giantbomb requests(superagent-cache, redis?)


const express = require("express")
  request = require("superagent"),
  _ = require("lodash"),
  moment = require('moment'),
  router = express.Router(),
  GAMES_COLLECTION = "games";

require('dotenv').load();

module.exports = function(db){

  router.get('/', function(req, res){
    const todayDateTime = moment().format('YYYY-MM-DD');
    request
      .get("http://www.giantbomb.com/api/games")
      .query({
        api_key: process.env.GIANTBOMB_KEY,
        format: "json",
        field_list: "name,original_release_date",
        sort: "original_release_date:desc",
        filter: `original_release_date:1700-01-01|${todayDateTime}`,
        limit: 50
      })
      .end(function(err, data){
        if (err) {
          console.log(err, "err");
        } else if (_.has(data, "res.body.results")){
          res.status(200).json(data.res.body.results);
        }
      });
  });

  // router.get('/currently_playing', function(req, res){
    // db.collection(GAMES_COLLECTION).find({}).toArray(function(err, docs) {
    //   res.status(200).json(docs);
    // });
    //
  // });

  return router;
};

