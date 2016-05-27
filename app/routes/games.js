const express = require('express'),
  request = require('superagent'),
  redisModule = require('cache-service-redis'),
  _ = require('lodash'),
  moment = require('moment'),
  router = express.Router(),
  authenticate = require('../auth/jwt_middleware'),
  User = require('../models/user').User,
  GAMES_COLLECTION = 'games'

require('dotenv').load()

if(process.env.REDIS_URL){
  var redisCache = new redisModule({redisUrl: process.env.REDIS_URL})
} else {
  var redisCache = new redisModule({redisData: {port: '6379', host: '127.0.0.1'}})
}

const cacheDefaults = {cacheWhenEmpty: false, expiration: 86400}
require('superagent-cache')(request, redisCache, cacheDefaults)

const userRoutes = ['/playing', '/planning', '/completed', '/onHold', '/dropped']

module.exports = function(db){
  router.get('/upcoming', function(req, res){
    const tmrDateTime = moment().add(1, 'days').format('YYYY-MM-DD')
    const page = req.query.page || 0
    const limit = req.query.limit || 16
    const offset = page * limit

    request
      .get("http://www.giantbomb.com/api/games")
      .query({
        api_key: process.env.GIANTBOMB_KEY,
        format: "json",
        field_list: "api_detail_url,name,expected_release_day,expected_release_month,expected_release_quarter,expected_release_year,image",
        sort: "original_release_date:asc",
        filter: `original_release_date:${tmrDateTime}|2018-12-00`,
        limit: limit,
        offset: offset
      })
      .end(function(err, data){
        if (err) {
          return res.status(404).send({message: "Could not fetch upcoming releases."})
        } else if (_.has(data, "body.results")){
          return res
            .links({
              next: `/games/recent?page=${page + 1}`,
              prev: `/games/recent?page=${(page-1) || 0}`
            })
            .json(data.body.results)
            .status(200)
        }
      })
  })

  router.get('/recent', function(req, res){
    const todayDateTime = moment().format('YYYY-MM-DD')
    const page = parseInt(req.query.page || 0)
    const limit = parseInt(req.query.limit || 16)
    const offset = page * limit

    request
      .get("http://www.giantbomb.com/api/games")
      .query({
        api_key: process.env.GIANTBOMB_KEY,
        format: "json",
        field_list: "api_detail_url,name,original_release_date,image",
        sort: "original_release_date:desc",
        filter: `original_release_date:1700-01-01|${todayDateTime}`,
        limit: limit,
        offset: offset
      })
      .end(function(err, data){
        if (err) {
          return res.status(404).send({message: "Could not fetch recent releases."})
        } else if (_.has(data, "body.results")){
          return res
            .links({
              next: `/games/recent?page=${page + 1}`,
              prev: `/games/recent?page=${(page-1) || 0}`
            })
            .json(data.body.results)
            .status(200)
        }
      })
  })

  router.get(userRoutes, authenticate, findUser, function(req, res){
    const games = req.user.gamesByType(req.path.slice(1))
    return res.status(200).json(games)
  })

  router.post(userRoutes, authenticate, findUser, function(req, res){
    const user = req.user
    if(user){
			if(req.body.game){
				const type = req.path.slice(1)
				const game = Object.assign({}, req.body.game, {type: type})
				user.addGame(game)
				// else if(req.body.games) user.addGames(req.body.games)

				user.save(function(err, doc){
					if(err){
						return res.status(404).json(err)
					} else{
						return res.status(200).json([game])
					}
				})
			}
    }
  })

  return router
}

function findUser(req, res, next) {
  User.findById(req.decoded.userId, function(err, doc){
    if(err) {
      return res.status(404).json({message: 'Failed to get user.'})
    } else {
      req.user = doc
      next()
    }
  })
}

