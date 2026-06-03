const SupportRequest = require("../models/SupportRequest");

class SupportRepository {
  create(data)             { return SupportRequest.create(data); }
  findByUser(userId)       { return SupportRequest.find({ user: userId }).sort({ createdAt: -1 }); }
  findById(id)             { return SupportRequest.findById(id); }
  findByIdAndUser(id, uid) { return SupportRequest.findOne({ _id: id, user: uid }); }
  save(doc)                { return doc.save(); }
}

module.exports = new SupportRepository();
