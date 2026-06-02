const Order = require("../models/Order");

class OrderRepository {
  findByOrderIdAndUser(orderId, userId) {
    return Order.findOne({ orderId, user: userId });
  }

  findAllByUser(userId, { skip, limit }) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("orderId status total paymentMethod paymentStatus estimatedDelivery createdAt items");
  }

  countByUser(userId) { return Order.countDocuments({ user: userId }); }

  create(data)   { return Order.create(data); }
  save(order)    { return order.save(); }
}

module.exports = new OrderRepository();
