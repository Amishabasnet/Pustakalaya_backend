const express = require("express");
const router = express.Router();

const {
  getHomeScreen,
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/home", getHomeScreen);   // Home screen feed (featured + recent)
router.get("/", getBooks);            // All books with search & filters
router.get("/:id", getBook);          // Single book

// Admin-only routes (protect for now; add role middleware later)
router.post("/", protect, createBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);

module.exports = router;
