const _ = require('lodash');
const {Review, validate, editValidate} = require("../models/review");
const {Company} = require("../models/company");

exports.createReview = async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const reviewData = {
        user: req.user._id,
        company: req.body.company,
        star: req.body.star,
        title: req.body.title,
        details: req.body.details
    };

    const company = await Company.findById(req.body.company);
    if(!company) return res.status(404).send("Not found");

    const review = new Review(reviewData);
    await review.save();

    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details"]));
};

exports.updateReview = async (req, res) => {
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
};

exports.deleteReview = async (req, res) => {
    let query;
    if (req.user.userType === 'admin') {
        query = {
            _id: req.params.id
        };
    } else {
        query = {
            _id: req.params.id,
            user: req.user._id
        };
    }

    const review = await Review.findOneAndUpdate(query, {
        $set: {
            status: "delete"
        }
    }, {new: true});

    if (!review) return res.status(404).send("Review not found");
    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details"]));
};

exports.reviewList = async (req, res) => {
    let query;
    if(req.body.company) {
        query = {
            company: req.body.company,
            status: 'active'
        };
    } else {
        query = {
            user: req.user._id,
            status: 'active'
        };
    }

    let review = await Review.find(query).lean();
    review = review.map(function(item) {
        delete item.__v;
        delete item.status;
        return item;
    });

    res.send(review);
};