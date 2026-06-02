const Wishlist = require("../models/Wishlist");
const Book = require("../models/Book");

// ─── GET /api/wishlist ────────────────────────────────────────────────────────
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "books.book",
      "title author price coverImage isVerified rating"
    );

    res.status(200).json({
      success: true,
      data: { books: wishlist ? wishlist.books : [] },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/wishlist/:bookId ───────────────────────────────────────────────
const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create wishlist and add book
      wishlist = await Wishlist.create({ user: req.user._id, books: [{ book: bookId }] });
      return res.status(200).json({ success: true, message: "Added to wishlist.", data: { wishlisted: true } });
    }

    const existingIndex = wishlist.books.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingIndex > -1) {
      // Remove from wishlist
      wishlist.books.splice(existingIndex, 1);
      await wishlist.save();
      return res.status(200).json({ success: true, message: "Removed from wishlist.", data: { wishlisted: false } });
    } else {
      // Add to wishlist
      wishlist.books.push({ book: bookId });
      await wishlist.save();
      return res.status(200).json({ success: true, message: "Added to wishlist.", data: { wishlisted: true } });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist };
