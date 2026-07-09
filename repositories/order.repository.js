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

  // ---- Admin: unrestricted across all users ----
  findByOrderId(orderId) { return Order.findOne({ orderId }); }

  findByUserAdmin(userId) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("orderId status total paymentMethod paymentStatus estimatedDelivery createdAt items");
  }

  findAllPaginated({ query, skip, limit }) {
    return Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName email");
  }

  countAllFiltered(query) { return Order.countDocuments(query); }

  findRecent(limit = 10) {
    return Order.find().sort({ createdAt: -1 }).limit(limit).populate("user", "fullName email");
  }

  sumPaidRevenue(paidStatus) {
    return Order.aggregate([
      { $match: { paymentStatus: paidStatus } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
  }

  countGroupByStatus() {
    return Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  }
}

module.exports = new OrderRepository();
