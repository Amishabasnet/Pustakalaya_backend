const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

// One review per user per book
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

//  Static: recalculate book's avg rating after save/delete 
reviewSchema.statics.recalculateRating = async function (bookId) {
  const Book = require("./Book");
  const result = await this.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: "$book", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      totalReviews: result[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, { rating: 0, totalReviews: 0 });
  }
};

reviewSchema.post("save", function () {
  this.constructor.recalculateRating(this.book);
});

reviewSchema.post("deleteOne", { document: true }, function () {
  this.constructor.recalculateRating(this.book);
});

module.exports = mongoose.model("Review", reviewSchema);
