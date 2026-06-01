const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  title: String,       // snapshot at order time
  author: String,
  coverImage: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },  // price per unit at purchase
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    //  Delivery 
    deliveryAddress: {
      fullName:  { type: String, required: true },
      phone:     { type: String, required: true },
      street:    { type: String, required: true },
      city:      { type: String, required: true },
      province:  { type: String, default: "" },
    },
    deliveryOption: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    deliveryCharge: {
      type: Number,
      required: true,
    },
    estimatedDelivery: {
      type: String,   // e.g. "2–4 days" or "1 day"
    },

    //  Payment 
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "card", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentTransactionId: {
      type: String,
      default: null,
    },

    //  Pricing 
    subtotal:   { type: Number, required: true },
    total:      { type: Number, required: true },

    //  Order Lifecycle 
    status: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    statusHistory: [
      {
        status:    String,
        note:      String,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

//  Auto-generate readable Order ID (e.g. #FS-11111) 
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const count = await this.constructor.countDocuments();
    this.orderId = `FS-${String(10000 + count + 1)}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
