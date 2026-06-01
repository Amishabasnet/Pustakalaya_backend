const Book = require("../models/Book");

//  GET /api/books/home 
// Returns featured books + recently added books for the home screen
const getHomeScreen = async (req, res, next) => {
  try {
    const [featured, recentlyAdded] = await Promise.all([
      Book.find({ isFeatured: true, stock: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title author price coverImage isVerified rating"),

      Book.find({ stock: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title author price coverImage isVerified rating"),
    ]);

    res.status(200).json({
      success: true,
      data: { featured, recentlyAdded },
    });
  } catch (error) {
    next(error);
  }
};

//  GET /api/books?search=&genre=&minPrice=&maxPrice=&page=&limit= 
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const query = { stock: { $gt: 0 } };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Genre filter
    if (genre) {
      query.genre = { $in: genre.split(",") };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select("title author price coverImage isVerified rating"),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

//  GET /api/books/:id 
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    res.status(200).json({ success: true, data: { book } });
  } catch (error) {
    next(error);
  }
};

//  POST /api/books (Admin) 
const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: "Book created.", data: { book } });
  } catch (error) {
    next(error);
  }
};

//  PUT /api/books/:id (Admin) 
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    res.status(200).json({ success: true, data: { book } });
  } catch (error) {
    next(error);
  }
};

//  DELETE /api/books/:id (Admin) 
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    res.status(200).json({ success: true, message: "Book deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHomeScreen, getBooks, getBook, createBook, updateBook, deleteBook };
