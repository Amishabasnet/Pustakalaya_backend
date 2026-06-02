const User = require("../models/User");

class UserRepository {
  findById(id)          { return User.findById(id); }
  findByEmail(email)    { return User.findOne({ email }); }
  findByEmailWithPass(email) { return User.findOne({ email }).select("+password"); }
  create(data)          { return User.create(data); }
  updateById(id, data)  { return User.findByIdAndUpdate(id, data, { new: true }); }
}

module.exports = new UserRepository();
