const _ = require('lodash');
const {Company} = require("../models/company");
const {getPageNumber, getPageSize} = require("../utils/pagination");

exports.companySuggestion = async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);
    const keyword = req.query.keyword;
    const query = [
        { $match : { "name" : new RegExp('^' + keyword , 'i') }},
        { $group : { "_id": "$name"}},
        { $sort : { "_id" : 1 } },
        { $skip : (pageNumber - 1) * pageSize},
        { $limit : pageSize}
    ];

    let company = await Company.aggregate(query);
    res.send(company);
};

exports.tagSuggestion = async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);
    const keyword = req.query.keyword;
    const query = [
        { $match : { "tags" : new RegExp('^' + keyword , 'i') }},
        { $unwind : "$tags"},
        { $match : { "tags" : new RegExp('^' + keyword , 'i') }},
        { $group : { "_id": "$tags"}},
        { $sort : { "_id" : 1 } },
        { $skip : (pageNumber - 1) * pageSize},
        { $limit : pageSize}
    ];

    let company = await Company.aggregate(query);
    res.send(company);
};