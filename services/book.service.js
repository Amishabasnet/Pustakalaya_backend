const bookRepo                    = require("../repositories/book.repository");
const reviewRepo                  = require("../repositories/review.repository");
const { NotFound }                = require("../errors/httpErrors");
const { HomeScreenDTO, BookDetailDTO, BookListItemDTO } = require("../dtos/book.dto");

const buildSortObj = (sort, hasQuery) => {
  if (sort === "relevance" && hasQuery) return { score: { $meta: "textScore" } };
  if (sort === "price_asc")  return { price: 1 };
  if (sort === "price_desc") return { price: -1 };
  if (sort === "rating")     return { rating: -1 };
  return { createdAt: -1 };
};

const buildQuery = (filters = {}) => {
  const q = { stock: { $gt: 0 } };
  if (filters.authors?.length)  q.author = { $in: filters.authors.map((a) => new RegExp(a, "i")) };
  if (filters.genres?.length)   q.genre  = { $in: filters.genres };
  if (filters.minRating)        q.rating = { $gte: Number(filters.minRating) };
  if (filters.minPrice || filters.maxPrice) {
    q.price = {};
    if (filters.minPrice) q.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) q.price.$lte = Number(filters.maxPrice);
  }
  if (filters.onSale) {
    q.originalPrice = { $exists: true, $ne: null };
    q.$expr = { $gt: ["$originalPrice", "$price"] };
  }
  return q;
};

class BookService {
  async getHomeScreen() {
    const [featured, recentlyAdded] = await Promise.all([
      bookRepo.findFeatured(10),
      bookRepo.findRecent(10),
    ]);
    return new HomeScreenDTO(featured, recentlyAdded);
  }

  async getBook(id) {
    const [book, recentReviews] = await Promise.all([
      bookRepo.findById(id),
      reviewRepo.getRecentByBook(id, 3),
    ]);
    if (!book) throw NotFound("Book not found.");

    const effectiveDiscount =
      book.originalPrice && book.originalPrice > book.price
        ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : book.discountPercent || 0;

    return new BookDetailDTO(book, effectiveDiscount, recentReviews);
  }

  async getBooks({ search, authors, genres, minRating, minPrice, maxPrice, sort = "newest", page = 1, limit = 20 }) {
    const filters = {
      authors: authors ? authors.split(",") : [],
      genres:  genres  ? genres.split(",")  : [],
      minRating, minPrice, maxPrice,
    };
    const query = buildQuery(filters);
    if (search?.trim()) query.$text = { $search: search.trim() };

    const skip    = (Number(page) - 1) * Number(limit);
    const sortObj = buildSortObj(sort, !!search);

    const [books, total] = await Promise.all([
      bookRepo.findWithFilters({ query, sort: sortObj, skip, limit: Number(limit) }),
      bookRepo.countWithFilters(query),
    ]);

    return { books: books.map((b) => new BookListItemDTO(b)), pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async getPopular(filters) {
    const query = buildQuery(filters);
    const skip  = (Number(filters.page || 1) - 1) * Number(filters.limit || 20);
    const books = await bookRepo.findPopular({ query, skip, limit: Number(filters.limit || 20) });
    const total = await bookRepo.countWithFilters({ ...query, rating: { $gte: 3 } });
    return { books: books.map((b) => new BookListItemDTO(b)), pagination: { total } };
  }

  async getNewReleased(filters) {
    const query = buildQuery(filters);
    const skip  = (Number(filters.page || 1) - 1) * Number(filters.limit || 20);
    const books = await bookRepo.findWithFilters({ query, sort: { createdAt: -1 }, skip, limit: Number(filters.limit || 20) });
    const total = await bookRepo.countWithFilters(query);
    return { books: books.map((b) => new BookListItemDTO(b)), pagination: { total } };
  }

  async getOnSale(filters) {
    const query = buildQuery({ ...filters, onSale: true });
    const skip  = (Number(filters.page || 1) - 1) * Number(filters.limit || 20);
    const books = await bookRepo.findOnSale({ query, skip, limit: Number(filters.limit || 20) });
    const total = await bookRepo.countWithFilters(query);
    return { books: books.map((b) => new BookListItemDTO(b)), pagination: { total } };
  }

  async getHighlyRecommended() {
    const books = await bookRepo.findHighlyRecommended(6);
    return books.map((b) => new BookListItemDTO(b));
  }

  async getFilterOptions() {
    const [authors, genres] = await Promise.all([
      bookRepo.getDistinctAuthors(),
      bookRepo.getDistinctGenres(),
    ]);
    return {
      authors: authors.sort(),
      genres:  genres.flat().filter(Boolean).sort(),
      pricingRanges: [
        { label: "High (NRs. 1000+)", min: 1000, max: null },
        { label: "Medium (500-999)",  min: 500,  max: 999  },
        { label: "Low (under 500)",   min: 0,    max: 499  },
      ],
      discountRanges: [
        { label: "Up to 10% off", max: 10 },
        { label: "Up to 20% off", max: 20 },
        { label: "Up to 50% off", max: 50 },
      ],
      ratingOptions: [1, 2, 3, 4, 5],
    };
  }

  async createBook(data)        { return bookRepo.create(data); }
  async updateBook(id, data)    {
    const book = await bookRepo.updateById(id, data);
    if (!book) throw NotFound("Book not found.");
    return book;
  }
  async deleteBook(id)          {
    const book = await bookRepo.deleteById(id);
    if (!book) throw NotFound("Book not found.");
    return book;
  }
}

module.exports = new BookService();
