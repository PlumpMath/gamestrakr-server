var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: String,
  someID: String
});

module.exports = mongoose.model('users', User)
