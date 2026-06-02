const router           = require("express").Router();
const bookCtrl         = require("../controllers/book.controller");
const reviewCtrl       = require("../controllers/review.controller");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");

// Public book routes 
router.get("/home",                bookCtrl.getHomeScreen.bind(bookCtrl));
router.get("/filter-options",      bookCtrl.getFilterOptions.bind(bookCtrl));
router.get("/highly-recommended",  bookCtrl.getHighlyRecommended.bind(bookCtrl));
router.get("/",                    bookCtrl.getBooks.bind(bookCtrl));
router.get("/:id",                 bookCtrl.getBook.bind(bookCtrl));

// Admin routes 
router.post("/",       protect, bookCtrl.createBook.bind(bookCtrl));
router.put("/:id",    protect, bookCtrl.updateBook.bind(bookCtrl));
router.delete("/:id", protect, bookCtrl.deleteBook.bind(bookCtrl));

// Review routes (nested) 
router.get   ("/:bookId/reviews", reviewCtrl.getReviews.bind(reviewCtrl));
router.post  ("/:bookId/reviews", protect, reviewCtrl.createReview.bind(reviewCtrl));
router.put   ("/:bookId/reviews", protect, reviewCtrl.updateReview.bind(reviewCtrl));
router.delete("/:bookId/reviews", protect, reviewCtrl.deleteReview.bind(reviewCtrl));

module.exports = router;
