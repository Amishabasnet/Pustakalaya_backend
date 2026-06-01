const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        priceAtAdd: {
          type: Number, // snapshot of price when added
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Virtual: total cart price
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
