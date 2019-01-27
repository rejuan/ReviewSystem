const express = require("express");
const _ = require('lodash');
const auth = require("../middleware/auth");
const {Review, validate, editValidate} = require("../models/review");
const {Company} = require("../models/company");
const router = express.Router();

router.post("/", auth, async (req, res) => {
    const {error} = validate(req.body);
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

router.put("/:id", auth, async (req, res) => {
    const {error} = editValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const query = {
        _id: req.params.id,
        user: req.user._id
    };

    const review = await Review.findOneAndUpdate(query, {
        $set: {
            star: req.body.star,
            title: req.body.title,
            details: req.body.details
        }
    }, {new: true});

    if (!review) return res.status(404).send("Review not found");
    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details"]));
});

module.exports = router;