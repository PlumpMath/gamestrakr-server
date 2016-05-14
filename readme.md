# GamerLyfe Server
## Dev Notes
### Start node sever locally
`node start.js`
`For auto reload- nodemon start.js`
### Make sure to have .env file
`MONGODB_URI='mongodb://localhost:27017/gamer-lyfe'`
`NODE_ENV='development'`
### Start mongodb sever locally
`mongod --dbpath=./data`

##TODO
* set up user accounts with oauth
* give user accounts ability to add currently playing
* cache giantbomb requests(superagent-cache, redis?)

