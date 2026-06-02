const Wishlist = require("../models/Wishlist");

const POPULATE = { path: "books.book", select: "title author price coverImage isVerified rating" };

class WishlistRepository {
  findByUser(userId)    { return Wishlist.findOne({ user: userId }).populate(POPULATE); }
  findByUserRaw(userId) { return Wishlist.findOne({ user: userId }); }
  create(userId, bookId) {
    return Wishlist.create({ user: userId, books: [{ book: bookId }] });
  }
  save(wishlist)        { return wishlist.save(); }
}

module.exports = new WishlistRepository();
