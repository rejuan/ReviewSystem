const express = require("express");
const _ = require('lodash');
const {Company} = require("../models/company");
const {getPageNumber, getPageSize} = require("../utils/pagination");
const router = express.Router();

router.get('/company', async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);
    const keyword = req.query.keyword;
    const query = {name: new RegExp('.*' + keyword + '.*', 'i')};

    let company = await Company.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({name: 1}).lean();

    company = company.map(function (item) {
        delete item.__v;
        delete item.status;
        return item;
    });

    res.send(company);
});

router.get('/tag', async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);
    const keyword = req.query.keyword;
    const query = {tags: new RegExp('^' + keyword , 'i')};

    let company = await Company.find(query)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({name: 1}).lean();

    company = company.map(function (item) {
        delete item.__v;
        delete item.status;
        return item;
    });

    res.send(company);
});

module.exports = router;