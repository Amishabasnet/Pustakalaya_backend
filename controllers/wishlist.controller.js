const wishlistService = require("../services/wishlist.service");

class WishlistController {
  async getWishlist(req, res, next) {
    try {
      const data = await wishlistService.getWishlist(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async toggleWishlist(req, res, next) {
    try {
      const result = await wishlistService.toggleWishlist(req.user._id, req.params.bookId);
      res.status(200).json({ success: true, message: result.message, data: { wishlisted: result.wishlisted } });
    } catch (err) { next(err); }
  }
}

module.exports = new WishlistController();
