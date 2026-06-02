const reviewRepo           = require("../repositories/review.repository");
const bookRepo             = require("../repositories/book.repository");
const { NotFound, Conflict, BadRequest } = require("../errors/httpErrors");
const { ReviewSummaryDTO } = require("../dtos/book.dto");

class ReviewService {
  async getReviews(bookId, { page = 1, limit = 10 }) {
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total, breakdown] = await Promise.all([
      reviewRepo.findByBook(bookId, { skip, limit: Number(limit) }),
      reviewRepo.countByBook(bookId),
      reviewRepo.getRatingBreakdown(bookId),
    ]);
    return {
      reviews: reviews.map((r) => new ReviewSummaryDTO(r)),
      breakdown,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    };
  }

  async createReview(bookId, userId, { rating, comment }) {
    if (!rating) throw BadRequest("Rating is required.");
    const book = await bookRepo.findById(bookId);
    if (!book) throw NotFound("Book not found.");

    const existing = await reviewRepo.findByBookAndUser(bookId, userId);
    if (existing) throw Conflict("You have already reviewed this book.");

    const review = await reviewRepo.create({ book: bookId, user: userId, rating: Number(rating), comment });
    await review.populate("user", "fullName");
    return new ReviewSummaryDTO(review);
  }

  async updateReview(bookId, userId, { rating, comment }) {
    const review = await reviewRepo.findByBookAndUser(bookId, userId);
    if (!review) throw NotFound("Review not found.");
    if (rating)            review.rating  = Number(rating);
    if (comment !== undefined) review.comment = comment;
    await review.save();
    await review.populate("user", "fullName");
    return new ReviewSummaryDTO(review);
  }

  async deleteReview(bookId, userId) {
    const review = await reviewRepo.findByBookAndUser(bookId, userId);
    if (!review) throw NotFound("Review not found.");
    await review.deleteOne();
  }
}

module.exports = new ReviewService();
