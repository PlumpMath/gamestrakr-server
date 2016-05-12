var mongoose = require("mongoose");

var gameSchema = mongoose.schema({
 name: String,
 giantBombId: Number
});

// define instance methods on schema.methods object
// e.g. gameSchema.methods

module.exports = gameSchema;
