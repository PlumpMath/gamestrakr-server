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

module.exports = function(db){
  router.get('/upcoming', function(req, res){
    fetchUpcomingReleases(res, req.query.limit);
  });

  router.get('/recent', function(req, res){
    fetchRecentReleases(res, req.query.limit);
  });

  router.get('/user', authenticate, findUser, function(req, res){
    const games = req.user.games;
    return res.status(200).json(games);
  });

  router.post('/user', authenticate, findUser, function(req, res){
    const reqGame = req.body.game;

    User.findById(req.decoded.userId, function(err, doc){
      if(doc && doc.games){
        const existingGame = _.find(doc.games, {name: reqGame.name})
        if (existingGame){
          const updatedGame = _.merge(existingGame, reqGame);
          doc.games[existingGame] = updatedGame;
        } else {
          doc.games.push(reqGame);
        }

        doc.save();
      }
    });
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
      } else if (_.has(data, "body.results")){
        return res.status(200).json(data.body.results);
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
      } else if (_.has(data, "body.results")){
        return res.status(200).json(data.body.results);
      }
    });
}

