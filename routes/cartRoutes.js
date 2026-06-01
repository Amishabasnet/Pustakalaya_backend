const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes require auth
router.use(protect);

router.get("/", getCart);                       // View cart
router.delete("/", clearCart);                  // Clear entire cart
router.post("/:bookId", addToCart);             // Add book to cart
router.patch("/:bookId", updateCartItem);       // Update quantity
router.delete("/:bookId", removeFromCart);      // Remove single item

module.exports = router;
