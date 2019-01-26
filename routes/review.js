const express = require("express");
const _ = require('lodash');
const auth = require("../middleware/auth");
const {Review, addValidate} = require("../models/review");
const router = express.Router();

router.post("/", auth, async (req, res) => {
    const {error} = addValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const reviewData = {
        user: req.user._id,
        company: req.body.company,
        star: req.body.star,
        title: req.body.title,
        details: req.body.details
    };

    const review = new Review(reviewData);
    await review.save();

    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details"]));
});

module.exports = router;