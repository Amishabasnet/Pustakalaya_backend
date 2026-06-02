const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title:           { type: String, required: true, trim: true },
    author:          { type: String, required: true, trim: true },
    price:           { type: Number, required: true, min: 0 },
    originalPrice:   { type: Number, default: null },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    coverImage:      { type: String, default: "" },
    description:     { type: String, trim: true, default: "" },
    genre:           { type: [String], default: [] },
    isbn:            { type: String, unique: true, sparse: true, trim: true },
    stock:           { type: Number, default: 0, min: 0 },
    isVerified:      { type: Boolean, default: false },
    isFeatured:      { type: Boolean, default: false },
    freeDeliveryOver:{ type: Number, default: 1500 },
    returnPolicy:    {
      type: String,
      default: "7-day hassle-free returns on all physical books. Raise a return from the app and we'll arrange free pickup. Refunds process in 3-5 business days.",
    },
    rating:          { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", description: "text" });

module.exports = mongoose.model("Book", bookSchema);
