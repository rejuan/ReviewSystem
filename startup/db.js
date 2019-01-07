const mongoose = require("mongoose");
const winstone = require("winston");
const config = require("config");

module.exports = function() {
  const db = config.get("db");
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .then(() => winstone.info(`${db} db server connected successfully`));
};
