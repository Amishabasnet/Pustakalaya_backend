const adminService = require("../services/admin.service");

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  // Users
  async getUsers(req, res, next) {
    try {
      const data = await adminService.getUsers(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getUserDetail(req, res, next) {
    try {
      const data = await adminService.getUserDetail(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const data = await adminService.toggleUserStatus(req.params.id);
      res.status(200).json({ success: true, message: "User status updated.", data });
    } catch (err) { next(err); }
  }

  // Orders
  async getOrders(req, res, next) {
    try {
      const data = await adminService.getOrders(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const data = await adminService.updateOrderStatus(req.params.orderId, req.body.status, req.body.note);
      res.status(200).json({ success: true, message: "Order status updated.", data });
    } catch (err) { next(err); }
  }

  // Books
  async getBooks(req, res, next) {
    try {
      const data = await adminService.getBooks(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async toggleBookVerify(req, res, next) {
    try {
      const data = await adminService.toggleBookVerify(req.params.id);
      res.status(200).json({ success: true, message: "Book verification updated.", data });
    } catch (err) { next(err); }
  }

  async toggleBookFeature(req, res, next) {
    try {
      const data = await adminService.toggleBookFeature(req.params.id);
      res.status(200).json({ success: true, message: "Book featured status updated.", data });
    } catch (err) { next(err); }
  }
}

module.exports = new AdminController();
