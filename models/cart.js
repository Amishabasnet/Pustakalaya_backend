const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        book:       { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        quantity:   { type: Number, required: true, min: 1, default: 1 },
        priceAtAdd: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
});
cartSchema.set("toJSON",   { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
