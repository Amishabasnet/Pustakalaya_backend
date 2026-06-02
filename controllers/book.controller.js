const bookService = require("../services/book.service");

class BookController {
  async getHomeScreen(req, res, next) {
    try {
      const data = await bookService.getHomeScreen();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getBooks(req, res, next) {
    try {
      const data = await bookService.getBooks(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getBook(req, res, next) {
    try {
      const data = await bookService.getBook(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async createBook(req, res, next) {
    try {
      const book = await bookService.createBook(req.body);
      res.status(201).json({ success: true, message: "Book created.", data: { book } });
    } catch (err) { next(err); }
  }

  async updateBook(req, res, next) {
    try {
      const book = await bookService.updateBook(req.params.id, req.body);
      res.status(200).json({ success: true, data: { book } });
    } catch (err) { next(err); }
  }

  async deleteBook(req, res, next) {
    try {
      await bookService.deleteBook(req.params.id);
      res.status(200).json({ success: true, message: "Book deleted." });
    } catch (err) { next(err); }
  }

  async getHighlyRecommended(req, res, next) {
    try {
      const books = await bookService.getHighlyRecommended();
      res.status(200).json({ success: true, data: { books } });
    } catch (err) { next(err); }
  }

  async getFilterOptions(req, res, next) {
    try {
      const data = await bookService.getFilterOptions();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getPopular(req, res, next) {
    try {
      const data = await bookService.getPopular(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getNewReleased(req, res, next) {
    try {
      const data = await bookService.getNewReleased(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getOnSale(req, res, next) {
    try {
      const data = await bookService.getOnSale(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }
}

module.exports = new BookController();
