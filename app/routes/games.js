const express = require('express'),
  request = require('superagent'),
  redisModule = require('cache-service-redis'),
  _ = require('lodash'),
  moment = require('moment'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware'),
  User = require('../models/user').User,
  GAMES_COLLECTION = 'games';

require('dotenv').load();

if(process.env.REDIS_URL){
  var redisCache = new redisModule({redisUrl: process.env.REDIS_URL});
} else {
  var redisCache = new redisModule({redisData: {port: '6379', host: '127.0.0.1'}});
}

const cacheDefaults = {cacheWhenEmpty: false, expiration: 86400};
require('superagent-cache')(request, redisCache, cacheDefaults);

const userRoutes = ['/playing', '/planning', '/completed', '/onHold', '/dropped'];

module.exports = function(db){
  router.get('/upcoming', function(req, res){
    fetchUpcomingReleases(res, req.query);
  });

  router.get('/recent', function(req, res){
    fetchRecentReleases(res, req.query);
  });

  router.get(userRoutes, authenticate, findUser, function(req, res){
    const games = req.user.gamesByStatus(req.path.slice(1));
    return res.status(200).json(games);
  });

  router.post('/user', authenticate, findUser, function(req, res){
    const user = req.user;
    if(user){
      if(req.body.game) user.addGame(req.body.game)
      else if(req.body.games) user.addGames(req.body.games);

      user.save(function(err, doc){
        if(err) res.status(404).json(err);
        else res.status(200);
      });
    }
  });

  return router;
};

function findUser(req, res, next) {
  User.findById(req.decoded.userId, function(err, doc){
    if(err) {
      return res.status(404).json({message: 'Failed to get user.'});
    } else {
      req.user = doc;
      next();
    }
  });
}

function fetchUpcomingReleases(res, query){
  const tmrDateTime = moment().add(1, 'days').format('YYYY-MM-DD');
  const page = query.page || 0;
  const limit = query.limit || 16
  const offset = page * limit;

  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "api_detail_url,name,expected_release_day,expected_release_month,expected_release_quarter,expected_release_year,image,deck,description,platforms,site_detail_url",
      sort: "original_release_date:asc",
      filter: `original_release_date:${tmrDateTime}|2018-12-00`,
      limit: limit,
      offset: offset
    })
    .end(function(err, data){
      if (err) {
        return res.status(404).send({message: "Could not fetch upcoming releases."});
      } else if (_.has(data, "body.results")){
        return res.status(200).json(data.body.results);
      }
    });
}

function fetchRecentReleases(res, query){
  const todayDateTime = moment().format('YYYY-MM-DD');
  const page = parseInt(query.page || 0);
  const limit = parseInt(query.limit || 16);
  const offset = page * limit;

  request
    .get("http://www.giantbomb.com/api/games")
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: "json",
      field_list: "api_detail_url,name,original_release_date,image,deck,description,platforms,site_detail_url",
      sort: "original_release_date:desc",
      filter: `original_release_date:1700-01-01|${todayDateTime}`,
      limit: limit,
      offset: offset
    })
    .end(function(err, data){
      if (err) {
        return res.status(404).send({message: "Could not fetch recent releases."});
      } else if (_.has(data, "body.results")){
        return res.status(200).json(data.body.results);
      }
    });
}
