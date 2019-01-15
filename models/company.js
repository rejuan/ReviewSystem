const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    image: String,
    contact: {
        mobile: String,
        address: String,
        website: String
    },
    details: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Company = mongoose.model("Company", companySchema);

function addValidate(company) {
    const schema = {
        name: Joi.string()
            .min(3)
            .max(255)
            .required()
    };

    return Joi.validate(company, schema);
}

exports.Company = Company;
exports.addValidate = addValidate;