const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { signUpValidators, signInValidators } = require("../middleware/validators");

// Public routes
router.post("/signup", signUpValidators, signUp);
router.post("/signin", signInValidators, signIn);
router.post("/signout", signOut);
router.post("/refresh", refreshToken);

// Protected routes (require valid JWT)
router.get("/me", protect, getMe);

module.exports = router;
