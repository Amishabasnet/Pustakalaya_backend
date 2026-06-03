const User = require("../models/User");

class UserRepository {
  findById(id)               { return User.findById(id); }
  findByIdWithPass(id)       { return User.findById(id).select("+password"); }
  findByEmail(email)         { return User.findOne({ email }); }
  findByEmailWithPass(email) { return User.findOne({ email }).select("+password"); }
  findByUsername(username)   { return User.findOne({ username }); }
  create(data)               { return User.create(data); }
  updateById(id, data)       { return User.findByIdAndUpdate(id, data, { new: true }); }
}

module.exports = new UserRepository();
