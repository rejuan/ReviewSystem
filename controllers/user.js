const _ = require('lodash');
const {getPageSize, getPageNumber} = require("../utils/pagination");
const {User} = require("../models/user");

exports.activeUserList = async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);

    let query = {
        status: 'active'
    };

    let user = await User.find(query)
        .sort({_id: 1})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean();

    user = user.map(function(item) {
        delete item.__v;
        delete item.password;
        return item;
    });

    res.send(user);
};

exports.suspendedUserList = async (req, res) => {
    const pageNumber = getPageNumber(req);
    const pageSize = getPageSize(req);

    let query = {
        status: 'suspend'
    };

    let user = await User.find(query)
        .sort({_id: 1})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean();

    user = user.map(function(item) {
        delete item.__v;
        delete item.password;
        return item;
    });

    res.send(user);
};

exports.suspendUser = async (req, res) => {
    let user = await User.findOne({
        _id : req.params.id,
        status: 'active'
    });

    if(!user) return res.status(404).send("Not found");

    user.status = 'suspend';
    user = await user.save();
    res.send(_.pick(user, ["_id", "status", "userType", "name", "email"]));
};

exports.activeUser = async (req, res) => {
    let user = await User.findOne({
        _id : req.params.id,
        status: 'suspend'
    });

    if(!user) return res.status(404).send("Not found");

    user.status = 'active';
    user = await user.save();
    res.send(_.pick(user, ["_id", "status", "userType", "name", "email"]));
};