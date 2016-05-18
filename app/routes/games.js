const express = require('express'),
  request = require('superagent'),
  _ = require('lodash'),
  moment = require('moment'),
  router = express.Router(),
  GAMES_COLLECTION = 'games';

require('dotenv').load();

module.exports = function(db){

  router.get('/', function(req, res){
    if(req.params.games_type == 'upcoming'){
      fetchUpcomingReleases(res, req.query.limit);
    } else {
      fetchRecentReleases(res, req.query.limit);
    }
  });

  return router;
};

function fetchUpcomingReleases(res, limit){
  const tmrDateTime = moment().add(1, 'days').format('YYYY-MM-DD');
  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "api_detail_url,name,expected_release_day,expected_release_month,expected_release_quarter,expected_release_year,image,deck,description,platforms,site_detail_url",
      sort: "original_release_date:asc",
      filter: `original_release_date:${tmrDateTime}|2018-12-00`,
      limit: limit || 20
    })
    .end(function(err, data){
      if (err) {
        return res.status(404).send({message: "Could not fetch upcoming releases."});
      } else if (_.has(data, "res.body.results")){
        return res.status(200).json(data.res.body.results);
      }
    });
}

function fetchRecentReleases(res, limit){
  const todayDateTime = moment().format('YYYY-MM-DD');
  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "api_detail_url,name,original_release_date,image,deck,description,platforms,site_detail_url",
      sort: "original_release_date:desc",
      filter: `original_release_date:1700-01-01|${todayDateTime}`,
      limit: limit || 20
    })
    .end(function(err, data){
      if (err) {
        return res.status(404).send({message: "Could not fetch recent releases."});
      } else if (_.has(data, "res.body.results")){
        return res.status(200).json(data.res.body.results);
      }
    });
}

