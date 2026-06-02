const bookRepo          = require("../repositories/book.repository");
const searchHistoryRepo = require("../repositories/searchHistory.repository");
const { BookListItemDTO } = require("../dtos/book.dto");

class SearchService {
  async search(query, filters, userId) {
    const result = await bookRepo.findWithFilters(query);
    if (userId && filters.q?.trim()) await this._saveHistory(userId, filters.q.trim());
    return result;
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

  async getRecentSearches(userId) {
    const history = await searchHistoryRepo.findByUser(userId);
    return history
      ? history.queries.sort((a, b) => b.searchedAt - a.searchedAt).slice(0, 8).map((q) => q.query)
      : [];
  }

  async clearRecentSearches(userId) {
    await searchHistoryRepo.clearByUser(userId);
  }

  async removeRecentSearch(userId, query) {
    const history = await searchHistoryRepo.findByUser(userId);
    if (history) {
      history.queries = history.queries.filter((q) => q.query !== query);
      await searchHistoryRepo.save(history);
    }
  }

  async _saveHistory(userId, query) {
    try {
      let history = await searchHistoryRepo.findByUser(userId);
      if (!history) history = await searchHistoryRepo.create(userId);
      history.queries = history.queries.filter((q) => q.query !== query);
      history.queries.unshift({ query, searchedAt: new Date() });
      history.queries = history.queries.slice(0, 20);
      await searchHistoryRepo.save(history);
    } catch (_) { /* non-critical */ }
  }
}

module.exports = new SearchService();
