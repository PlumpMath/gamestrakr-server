const express = require("express")
request = require("superagent"),
  _ = require("lodash"),
  moment = require('moment'),
  router = express.Router(),
  GAMES_COLLECTION = "games";

require('dotenv').load();

function fetchUpcomingReleases(res){
  const tmrDateTime = moment().add(1, 'days').format('YYYY-MM-DD');
  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "name,expected_release_day,expected_release_month,expected_release_quarter,expected_release_year,image,deck,description,platforms,site_detail_url",
      sort: "original_release_date:asc",
      filter: `original_release_date:${tmrDateTime}|2018-12-00`,
      limit: 50
    })
    .end(function(err, data){
      if (err) {
        console.log(err, "err");
      } else if (_.has(data, "res.body.results")){
        res.status(200).json(data.res.body.results);
      }
    });
}

function fetchRecentReleases(res){
  const todayDateTime = moment().format('YYYY-MM-DD');
  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "name,original_release_date,image,deck,description,platforms,site_detail_url",
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
}

module.exports = function(db){

  router.get('/', function(req, res){
    if(req.params.games_type == 'upcoming'){
      fetchUpcomingReleases(res);
    } else {
      fetchRecentReleases(res);
    }
  });

  return router;
};

