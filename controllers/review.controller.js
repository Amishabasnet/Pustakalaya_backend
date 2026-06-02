const reviewService = require("../services/review.service");

class ReviewController {
  async getReviews(req, res, next) {
    try {
      const data = await reviewService.getReviews(req.params.bookId, req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.params.bookId, req.user._id, req.body);
      res.status(201).json({ success: true, message: "Review submitted.", data: { review } });
    } catch (err) { next(err); }
  }

  async updateReview(req, res, next) {
    try {
      const review = await reviewService.updateReview(req.params.bookId, req.user._id, req.body);
      res.status(200).json({ success: true, message: "Review updated.", data: { review } });
    } catch (err) { next(err); }
  }

  async deleteReview(req, res, next) {
    try {
      await reviewService.deleteReview(req.params.bookId, req.user._id);
      res.status(200).json({ success: true, message: "Review deleted." });
    } catch (err) { next(err); }
  }
}

module.exports = new ReviewController();
