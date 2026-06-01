const express = require("express");
const router = express.Router();

const { getWishlist, toggleWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

// All wishlist routes require auth
router.use(protect);

router.get("/", getWishlist);                   // Get user's wishlist
router.post("/:bookId", toggleWishlist);        // Add or remove book (toggle)

module.exports = router;
