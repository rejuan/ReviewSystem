const _ = require("lodash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");
const {sendMail} = require("../email/forgotPassword");

const {
    User,
    registrationValidate,
    signinValidation,
    forgotPasswordValidation,
    checkJwtToken,
    resetPasswordValidation,
    changePasswordValidation
} = require("../models/user");

exports.registration = async (req, res) => {
    const {error} = registrationValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send("User already registered");

    user = new User(_.pick(req.body, ["name", "email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res
        .header("x-auth-token", token)
        .send(_.pick(user, ["_id", "name", "email"]));
};

exports.signin = async (req, res) => {
    const {error} = signinValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send("Email and password doesn't match");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
        return res.status(400).send("Email and password doesn't match");

    const token = user.generateAuthToken();
    res
        .header("x-auth-token", token)
        .send(_.pick(user, ["_id", "name", "email"]));
};

exports.forgotPassword = async (req, res) => {
    const {error} = forgotPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send("Email doesn't exist");

    const forgotPassword = {
        forgotPassword: {
            token: crypto.randomBytes(20).toString('hex'),
            createdAt: moment().unix()
        }
    };

    user.set(forgotPassword);
    await user.save();
    await sendMail(user.name, user.email, user.generateForgotPassToken());
    res.status(200).send("Success");
};

exports.resetPassword = async (req, res) => {
    let result = checkJwtToken(req.params.hash);
    if (!result) return res.status(400).send("Invalid token");

    const {error} = resetPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: result.email});
    if (!user) return res.status(404).send("Email not exist");

    if (user.forgotPassword.token != result.token) return res.status(400).send("Invalid token");

    const now = moment();
    const was = moment(user.forgotPassword.createdAt * 1000);
    if (now.diff(was, 'minutes') > 5) return res.status(401).send("Expired token");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    return res.status(200).send("Changed successfully");
};

exports.changePassword = async (req, res) => {
    const {error} = changePasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.newPassword != req.body.confirmPassword)
        return res.status(400).send("New password & confirm password should same");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("User doesn't exist");

    const validPassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!validPassword)
        return res.status(400).send("Email and password doesn't match");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.currentPassword, salt);
    await user.save();
    return res.status(200).send("Changed successfully");
};
