const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    book:    { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ book: 1, user: 1 }, { unique: true });

reviewSchema.statics.recalculateRating = async function (bookId) {
  const Book   = require("./Book");
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

reviewSchema.post("save",               function () { this.constructor.recalculateRating(this.book); });
reviewSchema.post("deleteOne", { document: true }, function () { this.constructor.recalculateRating(this.book); });

module.exports = mongoose.model("Review", reviewSchema);
