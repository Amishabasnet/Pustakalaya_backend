const config = require("../config/env");
const { BadRequest } = require("../errors/httpErrors");

class UploadController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) throw BadRequest("No image file provided.");
      const url = `${config.serverUrl}/uploads/covers/${req.file.filename}`;
      res.status(201).json({ success: true, message: "Image uploaded.", data: { url } });
    } catch (err) { next(err); }
  }
}

module.exports = new UploadController();
