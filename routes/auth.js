const express = require("express");
const authController = require("../controllers/auth");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/registration", authController.registration);

router.post("/signin", authController.signin);

router.post("/forgotPassword", authController.forgotPassword);

router.post("/resetPassword/:hash", authController.resetPassword);

router.post("/changePassword", auth, authController.changePassword);

module.exports = router;
