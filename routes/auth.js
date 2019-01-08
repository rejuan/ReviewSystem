const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const crypto = require("crypto");
const moment = require("moment");
const {sendMail} = require("../email/forgotPassword");

const router = express.Router();
const {
  User,
  registrationValidate,
  signinValidation,
  forgotPasswordValidation
} = require("../models/user");

router.post("/registration", async (req, res) => {
  const { error } = registrationValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

router.post("/signin", async (req, res) => {
  const { error } = signinValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email and password doesn't match");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Email and password doesn't match");

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

router.post("/forgotPassword", async (req, res) => {
  const { error } = forgotPasswordValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email});
  if(!user) return res.status(404).send("Email doesn't exist");

  const forgotPassword = {
    forgotPassword: {
      token : crypto.randomBytes(20).toString('hex'),
      createdAt : moment().unix()
    }
  };

  user.set(forgotPassword);
  await user.save();
  await sendMail(user.name, user.email, user.forgotPassword.token);
  res.status(200).send("Success");

});

module.exports = router;
