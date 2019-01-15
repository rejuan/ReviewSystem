const auth = require("../routes/auth");
const company = require("../routes/company");
const error = require("../middleware/error");
const bodyParser = require('body-parser');


module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/api/auth", auth);
    app.use("/api/company", company);
    app.use(error);
};
