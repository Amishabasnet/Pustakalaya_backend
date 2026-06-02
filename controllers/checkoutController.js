const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");

//  Delivery config 
const DELIVERY_OPTIONS = {
  standard: { charge: 120, label: "Standard delivery: 2–4 days", estimate: "2–4 days" },
  express:  { charge: 200, label: "Express delivery: 1 day",     estimate: "1 day" },
};

//  GET /api/checkout/summary 
// Returns cart items + delivery options + subtotal — used to render Checkout screen
const getCheckoutSummary = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book",
      "title author price coverImage isVerified rating stock"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add books before checking out.",
      });
    }

    // Validate stock is still available
    const stockIssues = [];
    for (const item of cart.items) {
      if (!item.book || item.book.stock < item.quantity) {
        stockIssues.push(item.book?.title || "Unknown book");
      }
    }
    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are out of stock: ${stockIssues.join(", ")}`,
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        subtotal,
        deliveryOptions: Object.entries(DELIVERY_OPTIONS).map(([key, val]) => ({
          key,
          label: val.label,
          charge: val.charge,
          estimate: val.estimate,
        })),
        paymentMethods: ["esewa", "khalti", "card", "cod"],
      },
    });
  } catch (error) {
    next(error);
  }
};

//  POST /api/checkout/place-order 
// Validates cart → creates Order → decrements stock → clears cart
const placeOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, deliveryOption = "standard", paymentMethod } = req.body;

    //  Validate required fields 
    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Delivery address and payment method are required.",
      });
    }
    const requiredAddr = ["fullName", "phone", "street", "city"];
    const missingAddr = requiredAddr.filter((f) => !deliveryAddress[f]);
    if (missingAddr.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing address fields: ${missingAddr.join(", ")}`,
      });
    }
    if (!["esewa", "khalti", "card", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method." });
    }
    if (!DELIVERY_OPTIONS[deliveryOption]) {
      return res.status(400).json({ success: false, message: "Invalid delivery option." });
    }

    //  Load & validate cart 
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    // Check stock and build order items (snapshot book data)
    const orderItems = [];
    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      if (!book || book.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${item.book.title}" is out of stock or has insufficient stock.`,
        });
      }
      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        quantity: item.quantity,
        price: item.priceAtAdd, // locked-in price
      });
    }

    const delivery = DELIVERY_OPTIONS[deliveryOption];
    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + delivery.charge;

    //  Create Order 
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      deliveryOption,
      deliveryCharge: delivery.charge,
      estimatedDelivery: delivery.estimate,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending", // set to "paid" after gateway callback
      subtotal,
      total,
      status: "placed",
      statusHistory: [{ status: "placed", note: "Order placed by customer." }],
    });

    //  Decrement stock 
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity } });
    }

    //  Clear cart 
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: {
        orderId: order.orderId,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (error) {
    next(error);
  }
};

//  GET /api/orders 
// User's order history
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("orderId status total paymentMethod paymentStatus estimatedDelivery createdAt items"),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

//  GET /api/orders/:orderId 
// Order detail / tracking screen
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    }).populate("items.book", "title author coverImage");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

//  PATCH /api/orders/:orderId/cancel 
// Cancel an order (only if placed/confirmed, not yet shipped)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const cancellableStatuses = ["placed", "confirmed"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at status: "${order.status}".`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = reason || "Cancelled by customer";
    order.statusHistory.push({ status: "cancelled", note: reason || "Cancelled by customer." });
    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled successfully.", data: { order } });
  } catch (error) {
    next(error);
  }
};

//  PATCH /api/orders/:orderId/payment-verify 
// Called after eSewa / Khalti gateway callback to mark payment as paid
const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId, status } = req.body; // from gateway webhook/redirect

    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.paymentTransactionId = transactionId;
    order.paymentStatus = status === "success" ? "paid" : "failed";

    if (status === "success") {
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", note: "Payment verified." });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: status === "success" ? "Payment confirmed." : "Payment failed.",
      data: { paymentStatus: order.paymentStatus, orderStatus: order.status },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCheckoutSummary,
  placeOrder,
  getOrders,
  getOrder,
  cancelOrder,
  verifyPayment,
};
