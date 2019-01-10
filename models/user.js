const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  forgotPassword: {
    token: String,
    createdAt: Number
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "active", "suspend"],
    default: "pending"
  },
  userType: {
    type: String,
    required: true,
    enum: ["user", "companyOwner", "admin"],
    default: "user"
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      userType: this.userType
    },
    config.get("jwtPrivateKey")
  );

  return token;
};

userSchema.methods.generateForgotPassToken = function() {
  const token = jwt.sign(
      {
        email: this.email,
        token: this.forgotPassword.token
      },
      config.get("jwtPrivateKey")
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function registrationValidate(user) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

function signinValidation(user) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

function forgotPasswordValidation(user) {
  const schema = {
    email: Joi.string()
        .required()
        .email()
  };

  return Joi.validate(user, schema);
}

function checkJwtToken(token) {
  try {
    const decode = jwt.verify(token, config.get("jwtPrivateKey"));
    if(!decode.hasOwnProperty("email") || !decode.hasOwnProperty("token")) {
      return false;
    } else {
      return decode;
    }
  } catch(Ex) {
    return false;
  }
}

function resetPasswordValidation(password) {
  const schema = {
    password: Joi.string()
        .min(5)
        .max(255)
        .required()
  };

  return Joi.validate(password, schema);
}

function changePasswordValidation(body) {
  const schema = {
    currentPassword: Joi.string()
        .min(5)
        .max(255)
        .required(),
    newPassword: Joi.string()
        .min(5)
        .max(255)
        .required(),
    confirmPassword: Joi.string()
        .min(5)
        .max(255)
        .required()
  };

  return Joi.validate(body, schema);
}

exports.User = User;
exports.registrationValidate = registrationValidate;
exports.signinValidation = signinValidation;
exports.forgotPasswordValidation = forgotPasswordValidation;
exports.checkJwtToken = checkJwtToken;
exports.resetPasswordValidation = resetPasswordValidation;
exports.changePasswordValidation = changePasswordValidation;
