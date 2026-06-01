const Review = require("../models/Review");
const Book = require("../models/Book");

//  GET /api/books/:bookId/reviews 
const getReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ book: bookId })
        .populate("user", "fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ book: bookId }),
    ]);

    // Rating breakdown (1–5 star counts)
    const breakdown = await Review.aggregate([
      { $match: { book: require("mongoose").Types.ObjectId.createFromHexString(bookId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        breakdown,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//  POST /api/books/:bookId/reviews 
const createReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    // Check for existing review
    const existing = await Review.findOne({ book: bookId, user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this book. Use PUT to update it.",
      });
    }

    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    await review.populate("user", "fullName");

    res.status(201).json({ success: true, message: "Review submitted.", data: { review } });
  } catch (error) {
    next(error);
  }
};

//  PUT /api/books/:bookId/reviews 
const updateReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ book: bookId, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await review.populate("user", "fullName");

    res.status(200).json({ success: true, message: "Review updated.", data: { review } });
  } catch (error) {
    next(error);
  }
};

//  DELETE /api/books/:bookId/reviews 
const deleteReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const review = await Review.findOne({ book: bookId, user: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: "Review deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
