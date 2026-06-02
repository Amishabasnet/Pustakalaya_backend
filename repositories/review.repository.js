const Review = require("../models/Review");

class ReviewRepository {
  findByBookAndUser(bookId, userId) {
    return Review.findOne({ book: bookId, user: userId });
  }

  findByBook(bookId, { skip, limit }) {
    return Review.find({ book: bookId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  countByBook(bookId) { return Review.countDocuments({ book: bookId }); }

  getRatingBreakdown(bookId) {
    const mongoose = require("mongoose");
    return Review.aggregate([
      { $match: { book: mongoose.Types.ObjectId.createFromHexString(bookId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);
  }

  getRecentByBook(bookId, limit = 3) {
    return Review.find({ book: bookId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  create(data)   { return Review.create(data); }
}

module.exports = new ReviewRepository();
