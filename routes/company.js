const express = require("express");
const multer = require('multer');
const _ = require('lodash');
const {upload} = require('../middleware/image');
const auth = require("../middleware/auth");
const {Company, addValidate} = require("../models/company");
const router = express.Router();

router.post("/", auth, async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(400).send(err.message);
        }

        const {error} = addValidate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const companyData = {
            name: req.body.name,
            image: req.file.filename,
            contact: {
                mobile: req.body.mobile,
                address: req.body.address,
                website: req.body.website
            },
            details: req.body.details,
            user: req.user._id
        };

        const company = new Company(companyData);
        await company.save();

        res.send(_.pick(company, ["_id", "name", "image", "contact", "details", "user"]));
    });
});

router.put('/:id', auth, async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(err.message);
        } else if (err) {
            return res.status(400).send(err.message);
        }

        let companyData = {
            name: req.body.name,
            contact: {
                mobile: req.body.mobile,
                address: req.body.address,
                website: req.body.website
            },
            details: req.body.details
        };

        if (req.file) {
            companyData.image = req.file.filename;
        }

        const {error} = addValidate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const query = {
            _id: req.params.id,
            user: req.user._id,
            status: 'active'
        };

        const company = await Company.findOneAndUpdate(query, companyData, {new: true});
        res.send(_.pick(company, ["_id", "name", "image", "contact", "details", "user"]));
    });
});

router.delete('/:id', auth, async (req, res) => {
    const query = {
        _id: req.params.id,
        user: req.user._id,
        status: 'active'
    };

    const company = await Company.findOneAndUpdate(query, {
        $set: {status: 'delete'}
    }, {new: true});

    if(!company) return res.status(404).send('Company not exist');

    res.send(_.pick(company, ["_id", "name", "image", "contact", "details", "user"]));
});

router.get('/:id', auth, async (req, res) => {
    const query = {
        _id: req.params.id,
        user: req.user._id,
        status: 'active'
    };

    const company = await Company.findOne(query);
    if(!company) return res.status(404).send("Company not exist");

    res.send(_.pick(company, ["_id", "name", "image", "contact", "details", "user"]));
});

module.exports = router;