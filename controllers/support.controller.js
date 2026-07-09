const supportService = require("../services/support.service");

class SupportController {
  async submitRequest(req, res, next) {
    try {
      const request = await supportService.submitRequest(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: "Support request submitted.",
        data: request,
      });
    } catch (err) { next(err); }
  }

  async getMyRequests(req, res, next) {
    try {
      const data = await supportService.getMyRequests(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getRequest(req, res, next) {
    try {
      const data = await supportService.getRequest(req.params.requestId, req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  // Admin
  async getAllRequests(req, res, next) {
    try {
      const data = await supportService.getAllRequests(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateRequest(req, res, next) {
    try {
      const data = await supportService.updateRequestAdmin(req.params.requestId, req.body);
      res.status(200).json({ success: true, message: "Support request updated.", data });
    } catch (err) { next(err); }
  }
}

module.exports = new SupportController();
