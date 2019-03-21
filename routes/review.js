const express = require("express");
const auth = require("../middleware/auth");
const reviewController = require("../controllers/review");
const router = express.Router();

router.post("/", auth, reviewController.createReview);

router.patch("/:id", auth, reviewController.updateReview);

router.delete("/:id", auth, reviewController.deleteReview);

router.get("/", auth, reviewController.reviewList);

module.exports = router;