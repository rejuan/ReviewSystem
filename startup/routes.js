const auth = require("../routes/auth");
const company = require("../routes/company");
const review = require("../routes/review");
const search = require("../routes/search");
const suggestion = require("../routes/suggestion");
const response = require("../routes/response");
const user = require("../routes/user");
const error = require("../middleware/error");
const bodyParser = require('body-parser');
const express = require("express");

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/api/auth", auth);
    app.use("/api/company", company);
    app.use("/api/review", review);
    app.use("/api/search", search);
    app.use("/api/suggestion", suggestion);
    app.use("/api/response", response);
    app.use("/api/user", user);
    app.use(error);
};
