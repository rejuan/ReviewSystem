const express = require("express");
const multer = require('multer');
const {upload} = require('../middleware/image');
const router = express.Router();

router.post("/", (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.messages);
        } else if (err) {
            return res.status(400).send(err.message);
        }

        console.log(req.file);
        res.status(200).send("Success");
    });
});

module.exports = router;