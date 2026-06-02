const orderRepo                  = require("../repositories/order.repository");
const cartRepo                   = require("../repositories/cart.repository");
const bookRepo                   = require("../repositories/book.repository");
const config                     = require("../config/env");
const { BadRequest, NotFound }   = require("../errors/httpErrors");
const { ORDER_STATUS, CANCELLABLE_STATUSES, PAYMENT_STATUS } = require("../types");
const { OrderResponseDTO, OrderConfirmationDTO } = require("../dtos/order.dto");

class OrderService {
  async getCheckoutSummary(userId) {
    const cart = await cartRepo.findByUser(userId);
    if (!cart || cart.items.length === 0)
      throw BadRequest("Your cart is empty. Add books before checking out.");

    const outOfStock = cart.items.filter((i) => !i.book || i.book.stock < i.quantity);
    if (outOfStock.length > 0)
      throw BadRequest(`Out of stock: ${outOfStock.map((i) => i.book?.title || "unknown").join(", ")}`);

    const subtotal = cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0);

    return {
      items: cart.items,
      subtotal,
      deliveryOptions: Object.entries(config.delivery).map(([key, v]) => ({
        key, label: v.label, charge: v.charge, estimate: v.estimate,
      })),
      paymentMethods: ["esewa", "khalti", "card", "cod"],
    };
  }

  async placeOrder(userId, dto) {
    const { deliveryAddress, deliveryOption, paymentMethod } = dto;

    const delivery = config.delivery[deliveryOption];
    if (!delivery) throw BadRequest("Invalid delivery option.");

    const cart = await cartRepo.findByUser(userId);
    if (!cart || cart.items.length === 0) throw BadRequest("Your cart is empty.");

    // Validate stock and snapshot items
    const orderItems = [];
    for (const item of cart.items) {
      const book = await bookRepo.findById(item.book._id || item.book);
      if (!book || book.stock < item.quantity)
        throw BadRequest(`"${item.book?.title || "A book"}" has insufficient stock.`);
      orderItems.push({
        book: book._id, title: book.title, author: book.author,
        coverImage: book.coverImage, quantity: item.quantity, price: item.priceAtAdd,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const total    = subtotal + delivery.charge;

    const order = await orderRepo.create({
      user: userId, items: orderItems, deliveryAddress,
      deliveryOption, deliveryCharge: delivery.charge,
      estimatedDelivery: delivery.estimate, paymentMethod,
      paymentStatus: PAYMENT_STATUS.PENDING, subtotal, total,
      status: ORDER_STATUS.PLACED,
      statusHistory: [{ status: ORDER_STATUS.PLACED, note: "Order placed by customer." }],
    });

    // Decrement stock + clear cart
    await Promise.all([
      ...orderItems.map((i) => bookRepo.decrementStock(i.book, i.quantity)),
      cartRepo.clear(userId),
    ]);

    return new OrderConfirmationDTO(order);
  }

  async getOrders(userId, { page = 1, limit = 10 }) {
    const skip  = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      orderRepo.findAllByUser(userId, { skip, limit: Number(limit) }),
      orderRepo.countByUser(userId),
    ]);
    return { orders, pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async getOrder(orderId, userId) {
    const order = await orderRepo.findByOrderIdAndUser(orderId, userId);
    if (!order) throw NotFound("Order not found.");
    return new OrderResponseDTO(order);
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await orderRepo.findByOrderIdAndUser(orderId, userId);
    if (!order) throw NotFound("Order not found.");
    if (!CANCELLABLE_STATUSES.includes(order.status))
      throw BadRequest(`Order cannot be cancelled at status: "${order.status}".`);

    // Restore stock
    await Promise.all(order.items.map((i) => bookRepo.incrementStock(i.book, i.quantity)));

    order.status       = ORDER_STATUS.CANCELLED;
    order.cancelledAt  = new Date();
    order.cancelReason = reason || "Cancelled by customer.";
    order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: order.cancelReason });
    await orderRepo.save(order);

    return new OrderResponseDTO(order);
  }

  async verifyPayment(orderId, userId, { transactionId, status }) {
    const order = await orderRepo.findByOrderIdAndUser(orderId, userId);
    if (!order) throw NotFound("Order not found.");

    order.paymentTransactionId = transactionId;
    order.paymentStatus = status === "success" ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

    if (status === "success") {
      order.status = ORDER_STATUS.CONFIRMED;
      order.statusHistory.push({ status: ORDER_STATUS.CONFIRMED, note: "Payment verified." });
    }
    await orderRepo.save(order);
    return { paymentStatus: order.paymentStatus, orderStatus: order.status };
  }
}

module.exports = new OrderService();
