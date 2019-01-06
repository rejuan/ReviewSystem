const mongoose = require("mongoose");
const winstone = require("winston");

module.exports = function() {
  mongoose
    .connect(
      "mongodb://localhost/review",
      { useNewUrlParser: true }
    )
    .then(() => winstone.info("Mongodb connected successfully"));
};
