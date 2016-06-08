const express = require('express');
const request = require('superagent');
const redisModule = require('cache-service-redis');
const _ = require('lodash');
const moment = require('moment');
const router = express.Router();
const authenticate = require('../auth/jwt_middleware');
const User = require('../models/user').User;

require('dotenv').load();

if (process.env.REDIS_URL) {
  var redisCache = new redisModule({ redisUrl: process.env.REDIS_URL });
} else {
  var redisCache = new redisModule({ redisData: { port: '6379', host: '127.0.0.1' } });
}

const cacheDefaults = { cacheWhenEmpty: false, expiration: 86400 };
require('superagent-cache')(request, redisCache, cacheDefaults);

const userRoutes = ['/playing', '/planning', '/completed', '/onHold', '/dropped'];

function findUser(req, res, next) {
  User.findById(req.decoded.userId, function (err, doc) {
    if (err) {
      return res.status(404).json({ message: 'Failed to get user.' });
    }
    req.user = doc;
    next();
  });
}

module.exports = function () {
  router.get('/by_name', function (req, res) {
    const name = req.query.name;
    request
    .get('http://www.giantbomb.com/api/search')
    .query({
      api_key: process.env.GIANTBOMB_KEY,
      format: 'json',
      query: name,
      field_list: 'api_detail_url,name,original_release_date,image,deck,description,platforms',
      limit: 5,
      resource_type: 'game',
    })
    .end(function (err, data) {
      if (err) {
        return res.status(404).send({ message: `Could not fetch game, ${name}` });
      } else if (_.has(data, 'body.results')) {
        return res.json(data.body.results);
      }
    });
  });

  router.get('/upcoming', function (req, res) {
    const tmrDateTime = moment().add(1, 'days').format('YYYY-MM-DD');
    const page = req.query.page || 0;
    const limit = req.query.limit || 16;
    const offset = page * limit;

    request
      .get('http://www.giantbomb.com/api/games')
      .query({
        api_key: process.env.GIANTBOMB_KEY,
        format: 'json',
        field_list: 'api_detail_url,name,expected_release_day,expected_release_month,expected_release_quarter,expected_release_year,image,deck,description,platforms',
        sort: 'original_release_date:asc',
        filter: `original_release_date:${tmrDateTime}|2018-12-00`,
        limit,
        offset,
      })
      .end(function (err, data) {
        if (err) {
          return res.status(404).send({ message: 'Could not fetch upcoming releases.' });
        } else if (_.has(data, 'body.results')) {
          return res
            .links({
              next: `/games/recent?page=${page + 1}`,
              prev: `/games/recent?page=${(page - 1) || 0}`,
            })
            .json(data.body.results);
        }
      });
  });

  router.get('/recent', function (req, res) {
    const todayDateTime = moment().format('YYYY-MM-DD');
    const page = parseInt(req.query.page || 0, 10);
    const limit = parseInt(req.query.limit || 16, 10);
    const offset = page * limit;

    request
      .get('http://www.giantbomb.com/api/games')
      .query({
        api_key: process.env.GIANTBOMB_KEY,
        format: 'json',
        field_list: 'api_detail_url,name,original_release_date,image,deck,description,platforms',
        sort: 'original_release_date:desc',
        filter: `original_release_date:1700-01-01|${todayDateTime}`,
        limit,
        offset,
      })
      .end(function (err, data) {
        if (err) {
          return res.status(404).send({ message: 'Could not fetch recent releases.' });
        } else if (_.has(data, 'body.results')) {
          return res
            .links({
              next: `/games/recent?page=${page + 1}`,
              prev: `/games/recent?page=${(page - 1) || 0}`,
            })
            .json(data.body.results);
        }
      });
  });

  router.get(userRoutes, authenticate, findUser, (req, res) => {
    const games = req.user.gamesByType(req.path.slice(1));
    return res.status(200).json(games);
  });

  router.post(userRoutes, authenticate, findUser, (req, res) => {
    const user = req.user;
    if (user) {
      if (req.body.game) {
        const type = req.path.slice(1);
        const game = Object.assign({}, req.body.game, { type });
        user.addGame(game);
        // else if(req.body.games) user.addGames(req.body.games)

        user.save((err) => {
          if (err) {
            return res.status(404).json(err);
          }
          return res.status(200).json(game);
        });
      }
    }
  });

  return router;
};

