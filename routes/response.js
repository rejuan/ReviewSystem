const express = require("express");
const auth = require("../middleware/auth");
const responseController = require("../controllers/response");
const router = express.Router();

router.post("/", auth, responseController.createResponse);

router.patch("/", auth, responseController.updateResponse);

router.delete("/", auth, responseController.deleteResponse);

module.exports = router;