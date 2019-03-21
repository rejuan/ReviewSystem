const _ = require('lodash');
const {Review, responseValidate, deleteResponseValidate} = require("../models/review");
const {Company} = require("../models/company");

exports.createResponse = async (req, res) => {
    const {error} = responseValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let review = await Review.findById(req.body.id).populate('company');
    if(!review) return res.status(404).send("Not found");

    if(review.company.user.toString() != req.user._id) return res.status(401).send("You are not the company owner.");

    review.response = req.body.response;
    review = await review.save();

    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details", "response"]));
};

exports.updateResponse = async (req, res) => {
    const {error} = responseValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let review = await Review.findById(req.body.id).populate('company');
    if(!review) return res.status(404).send("Not found");

    if(review.company.user.toString() != req.user._id) return res.status(401).send("You are not the company owner.");

    review.response = req.body.response;
    review = await review.save();

    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details", "response"]));
};

exports.deleteResponse = async (req, res) => {
    const {error} = deleteResponseValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let review = await Review.findById(req.body.id).populate('company');
    if(!review) return res.status(404).send("Not found");

    if(review.company.user.toString() != req.user._id) return res.status(401).send("You are not the company owner.");

    review.response = null;
    review = await review.save();

    res.send(_.pick(review, ["_id", "user", "company", "star", "title", "details", "response"]));
};