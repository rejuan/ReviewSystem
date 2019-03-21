const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const userController = require("../controllers/user");
const router = express.Router();

router.get("/active", [auth, admin] , userController.activeUserList);

router.get("/suspended", [auth, admin] , userController.suspendedUserList);

router.patch("/suspend/:id", [auth, admin] , userController.suspendUser);

router.patch("/unsuspend/:id", [auth, admin] , userController.activeUser);

module.exports = router;