const SearchHistory = require("../models/SearchHistory");

class SearchHistoryRepository {
  findByUser(userId)   { return SearchHistory.findOne({ user: userId }); }
  create(userId)       { return SearchHistory.create({ user: userId, queries: [] }); }
  save(history)        { return history.save(); }
  clearByUser(userId)  { return SearchHistory.findOneAndUpdate({ user: userId }, { queries: [] }); }
}

module.exports = new SearchHistoryRepository();
