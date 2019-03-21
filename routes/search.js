const express = require("express");
const searchController = require("../controllers/search");
const router = express.Router();

router.get('/company', searchController.searchByCompany);

router.get('/tag', searchController.searchByTag);

module.exports = router;