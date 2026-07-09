const SupportRequest = require("../models/SupportRequest");

class SupportRepository {
  create(data)             { return SupportRequest.create(data); }
  findByUser(userId)       { return SupportRequest.find({ user: userId }).sort({ createdAt: -1 }); }
  findById(id)             { return SupportRequest.findById(id); }
  findByIdAndUser(id, uid) { return SupportRequest.findOne({ _id: id, user: uid }); }
  save(doc)                { return doc.save(); }

  // Admin: unrestricted across all users
  findAllPaginated({ query, skip, limit }) {
    return SupportRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "fullName email");
  }

  countAllFiltered(query) { return SupportRequest.countDocuments(query); }

  findRecent(limit = 10) {
    return SupportRequest.find().sort({ createdAt: -1 }).limit(limit).populate("user", "fullName email");
  }
}

module.exports = new SupportRepository();
