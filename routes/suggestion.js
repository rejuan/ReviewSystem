const express = require("express");
const suggestionController = require("../controllers/suggestion");
const router = express.Router();

router.get('/company', suggestionController.companySuggestion);

router.get('/tag', suggestionController.tagSuggestion);

module.exports = router;