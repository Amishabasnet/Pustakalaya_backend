const router      = require("express").Router();
const reviewCtrl  = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/my-reviews", reviewCtrl.getMyReviews.bind(reviewCtrl));

module.exports = router;
