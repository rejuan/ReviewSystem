const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30
    },
    details: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 1024
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "delete"],
        default: "active"
    },
    response: {
        type: String,
        minLength: 3,
        maxLength: 512
    }
});

const Review = mongoose.model("Review", reviewSchema);

function validate(review) {
    const schema = {
        company: Joi.objectId().required(),
        star: Joi.number().integer().min(1).max(5).required(),
        title: Joi.string().min(3).max(30).required(),
        details: Joi.string().min(3).max(1024).required()
    };

    return Joi.validate(review, schema);
}

function editValidate(review) {
    const schema = {
        star: Joi.number().integer().min(1).max(5).required(),
        title: Joi.string().min(3).max(30).required(),
        details: Joi.string().min(3).max(1024).required()
    };

    return Joi.validate(review, schema);
}

function responseValidate(response) {
    const schema = {
        id: Joi.objectId().required(),
        response: Joi.string().min(3).max(512).required()
    };

    return Joi.validate(response, schema);
}

exports.Review = Review;
exports.validate = validate;
exports.editValidate = editValidate;
exports.responseValidate = responseValidate;