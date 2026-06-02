const Book = require("../models/Book");

const LIST_FIELDS = "title author price originalPrice discountPercent coverImage isVerified rating totalReviews genre";

class BookRepository {
  findById(id) { return Book.findById(id); }

  findFeatured(limit = 10) {
    return Book.find({ isFeatured: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 }).limit(limit).select(LIST_FIELDS);
  }

  findRecent(limit = 10) {
    return Book.find({ stock: { $gt: 0 } })
      .sort({ createdAt: -1 }).limit(limit).select(LIST_FIELDS);
  }

  findWithFilters({ query, sort, skip, limit }) {
    return Book.find(query, query.$text ? { score: { $meta: "textScore" } } : {})
      .sort(sort).skip(skip).limit(limit).select(LIST_FIELDS);
  }

  countWithFilters(query) { return Book.countDocuments(query); }

  findPopular({ query, skip, limit }) {
    return Book.find({ ...query, rating: { $gte: 3 } })
      .sort({ rating: -1, totalReviews: -1 }).skip(skip).limit(limit).select(LIST_FIELDS);
  }

  findOnSale({ query, skip, limit }) {
    return Book.find(query).sort({ discountPercent: -1, createdAt: -1 }).skip(skip).limit(limit).select(LIST_FIELDS);
  }

  findHighlyRecommended(limit = 6) {
    return Book.find({ stock: { $gt: 0 }, rating: { $gte: 4 } })
      .sort({ rating: -1, totalReviews: -1 }).limit(limit)
      .select("title author price coverImage rating");
  }

  getDistinctAuthors() { return Book.distinct("author", { stock: { $gt: 0 } }); }
  getDistinctGenres()  { return Book.distinct("genre",  { stock: { $gt: 0 } }); }

  create(data)               { return Book.create(data); }
  updateById(id, data)       { return Book.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
  deleteById(id)             { return Book.findByIdAndDelete(id); }
  decrementStock(id, qty)    { return Book.findByIdAndUpdate(id, { $inc: { stock: -qty } }); }
  incrementStock(id, qty)    { return Book.findByIdAndUpdate(id, { $inc: { stock:  qty } }); }
}

module.exports = new BookRepository();
