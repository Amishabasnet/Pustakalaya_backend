const express = require("express");
const router = express.Router();

const {
  getCheckoutSummary,
  placeOrder,
  getOrders,
  getOrder,
  cancelOrder,
  verifyPayment,
} = require("../controllers/checkoutController");

const { protect } = require("../middleware/authMiddleware");

// All routes require auth
router.use(protect);

//  Checkout flow 
router.get("/summary", getCheckoutSummary);   // Cart → Checkout screen data
router.post("/place-order", placeOrder);       // Checkout → Confirmation

//  Orders 
router.get("/orders", getOrders);                                    // Order history
router.get("/orders/:orderId", getOrder);                            // Track order
router.patch("/orders/:orderId/cancel", cancelOrder);                // Cancel order
router.patch("/orders/:orderId/payment-verify", verifyPayment);      // Payment gateway callback

module.exports = router;
