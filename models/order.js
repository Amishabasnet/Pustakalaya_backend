const mongoose = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require("../types");

const orderItemSchema = new mongoose.Schema({
  book:       { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  title:      String,
  author:     String,
  coverImage: String,
  quantity:   { type: Number, required: true, min: 1 },
  price:      { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:   [orderItemSchema],

    deliveryAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      province: { type: String, default: "" },
    },
    deliveryOption:    { type: String, enum: ["standard", "express"], default: "standard" },
    deliveryCharge:    { type: Number, required: true },
    estimatedDelivery: { type: String },

    paymentMethod:        { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus:        { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    paymentTransactionId: { type: String, default: null },

    subtotal: { type: Number, required: true },
    total:    { type: Number, required: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
    },
    statusHistory: [
      {
        status:    String,
        note:      String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    cancelledAt:  { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await this.constructor.countDocuments();
    this.orderId = `FS-${10000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
