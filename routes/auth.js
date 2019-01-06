const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  throw new Error("exception");
  res.status(200).send("Success");
});

module.exports = router;
