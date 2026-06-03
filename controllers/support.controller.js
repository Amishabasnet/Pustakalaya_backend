const bookService   = require("../services/book.service");
const searchService = require("../services/search.service");

class SearchController {
  async search(req, res, next) {
    try {
      const data = await bookService.getBooks(req.query);
      // Save history if authenticated
      if (req.user && req.query.q?.trim()) {
        await searchService._saveHistory(req.user._id, req.query.q.trim());
      }
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

  async getFilterOptions(req, res, next) {
    try {
      const data = await bookService.getFilterOptions();
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getHighlyRecommended(req, res, next) {
    try {
      const books = await searchService.getHighlyRecommended();
      res.status(200).json({ success: true, data: { books } });
    } catch (err) { next(err); }
  }

  async getRecentSearches(req, res, next) {
    try {
      const queries = await searchService.getRecentSearches(req.user._id);
      res.status(200).json({ success: true, data: { queries } });
    } catch (err) { next(err); }
  }

  async clearRecentSearches(req, res, next) {
    try {
      await searchService.clearRecentSearches(req.user._id);
      res.status(200).json({ success: true, message: "Recent searches cleared." });
    } catch (err) { next(err); }
  }

  async removeRecentSearch(req, res, next) {
    try {
      await searchService.removeRecentSearch(req.user._id, req.params.query);
      res.status(200).json({ success: true, message: "Search removed." });
    } catch (err) { next(err); }
  }
}

module.exports = new SearchController();
