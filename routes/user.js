const express = require("express");
const _ = require('lodash');
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {getPageSize, getPageNumber} = require("../utils/pagination");
const {User} = require("../models/user");
const router = express.Router();

router.get("/active", [auth, admin] , async (req, res) => {
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
});

module.exports = router;