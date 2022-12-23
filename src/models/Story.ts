const mongoose = require("mongoose");

const schema = mongoose.schema({
  link: String,
  addedOn: Date,
  removedOn: Date,
  pageLocation: String,
  active: Boolean
});

module.exports = mongoose.model("Story", schema);
