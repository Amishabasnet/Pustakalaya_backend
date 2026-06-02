const cartService = require("../services/cart.service");

class CartController {
  async getCart(req, res, next) {
    try {
      const data = await cartService.getCart(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async addToCart(req, res, next) {
    try {
      const data = await cartService.addToCart(req.user._id, req.params.bookId, req.body.quantity);
      res.status(200).json({ success: true, message: "Added to cart.", data });
    } catch (err) { next(err); }
  }

  async updateItem(req, res, next) {
    try {
      await cartService.updateItem(req.user._id, req.params.bookId, req.body.quantity);
      res.status(200).json({ success: true, message: "Cart updated." });
    } catch (err) { next(err); }
  }

  async removeItem(req, res, next) {
    try {
      const data = await cartService.removeItem(req.user._id, req.params.bookId);
      res.status(200).json({ success: true, message: "Item removed.", data });
    } catch (err) { next(err); }
  }

  async clearCart(req, res, next) {
    try {
      await cartService.clearCart(req.user._id);
      res.status(200).json({ success: true, message: "Cart cleared." });
    } catch (err) { next(err); }
  }
}

module.exports = new CartController();
