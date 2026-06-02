const wishlistRepo = require("../repositories/wishlist.repository");
const bookRepo     = require("../repositories/book.repository");
const { NotFound } = require("../errors/httpErrors");

class WishlistService {
  async getWishlist(userId) {
    const wishlist = await wishlistRepo.findByUser(userId);
    return { books: wishlist ? wishlist.books : [] };
  }

  async toggleWishlist(userId, bookId) {
    const book = await bookRepo.findById(bookId);
    if (!book) throw NotFound("Book not found.");

    let wishlist = await wishlistRepo.findByUserRaw(userId);

    if (!wishlist) {
      await wishlistRepo.create(userId, bookId);
      return { wishlisted: true, message: "Added to wishlist." };
    }

    const idx = wishlist.books.findIndex((i) => i.book.toString() === bookId);
    if (idx > -1) {
      wishlist.books.splice(idx, 1);
      await wishlistRepo.save(wishlist);
      return { wishlisted: false, message: "Removed from wishlist." };
    } else {
      wishlist.books.push({ book: bookId });
      await wishlistRepo.save(wishlist);
      return { wishlisted: true, message: "Added to wishlist." };
    }
  }
}

module.exports = new WishlistService();
