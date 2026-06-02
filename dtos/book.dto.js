class BookListItemDTO {
  constructor(book) {
    this._id             = book._id;
    this.title           = book.title;
    this.author          = book.author;
    this.price           = book.price;
    this.originalPrice   = book.originalPrice;
    this.discountPercent = book.discountPercent;
    this.coverImage      = book.coverImage;
    this.isVerified      = book.isVerified;
    this.rating          = book.rating;
    this.totalReviews    = book.totalReviews;
    this.genre           = book.genre;
  }
}

class BookDetailDTO {
  constructor(book, effectiveDiscount, recentReviews = []) {
    this._id              = book._id;
    this.title            = book.title;
    this.author           = book.author;
    this.price            = book.price;
    this.originalPrice    = book.originalPrice;
    this.discountPercent  = book.discountPercent;
    this.effectiveDiscount= effectiveDiscount;
    this.coverImage       = book.coverImage;
    this.description      = book.description;
    this.genre            = book.genre;
    this.isVerified       = book.isVerified;
    this.isFeatured       = book.isFeatured;
    this.rating           = book.rating;
    this.totalReviews     = book.totalReviews;
    this.stock            = book.stock;
    this.returnPolicy     = book.returnPolicy;
    this.freeDeliveryOver = book.freeDeliveryOver;
    this.recentReviews    = recentReviews.map((r) => new ReviewSummaryDTO(r));
    this.createdAt        = book.createdAt;
  }
}

class ReviewSummaryDTO {
  constructor(review) {
    this._id       = review._id;
    this.rating    = review.rating;
    this.comment   = review.comment;
    this.user      = { _id: review.user?._id, fullName: review.user?.fullName };
    this.createdAt = review.createdAt;
  }
}

class HomeScreenDTO {
  constructor(featured, recentlyAdded) {
    this.featured      = featured.map((b) => new BookListItemDTO(b));
    this.recentlyAdded = recentlyAdded.map((b) => new BookListItemDTO(b));
  }
}

module.exports = { BookListItemDTO, BookDetailDTO, ReviewSummaryDTO, HomeScreenDTO };
