const express = require("express");
const multer = require('multer');
const {upload} = require('../middleware/image');
const auth = require("../middleware/auth");
const {Company, addValidate} = require("../models/company");
const router = express.Router();

router.post("/", auth, async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(400).send(err.message);
        }

        const {error} = addValidate(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        //let company = new Company(_.pick(req.body, ["name", "email", "password"]));

        res.status(200).send("Success");
    });
});

module.exports = router;