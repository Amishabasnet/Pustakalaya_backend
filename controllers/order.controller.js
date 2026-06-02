const orderService      = require("../services/order.service");
const { PlaceOrderDTO } = require("../dtos/order.dto");

class OrderController {
  async getCheckoutSummary(req, res, next) {
    try {
      const data = await orderService.getCheckoutSummary(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async placeOrder(req, res, next) {
    try {
      const dto  = new PlaceOrderDTO(req.body);
      const data = await orderService.placeOrder(req.user._id, dto);
      res.status(201).json({ success: true, message: "Order placed successfully!", data });
    } catch (err) { next(err); }
  }

  async getOrders(req, res, next) {
    try {
      const data = await orderService.getOrders(req.user._id, req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getOrder(req, res, next) {
    try {
      const data = await orderService.getOrder(req.params.orderId, req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async cancelOrder(req, res, next) {
    try {
      const data = await orderService.cancelOrder(req.params.orderId, req.user._id, req.body.reason);
      res.status(200).json({ success: true, message: "Order cancelled.", data });
    } catch (err) { next(err); }
  }

  async verifyPayment(req, res, next) {
    try {
      const data = await orderService.verifyPayment(req.params.orderId, req.user._id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }
}

module.exports = new OrderController();
