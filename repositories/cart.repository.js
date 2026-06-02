const Cart = require("../models/Cart");

const POPULATE = { path: "items.book", select: "title author price coverImage stock isVerified rating" };

class CartRepository {
  findByUser(userId)           { return Cart.findOne({ user: userId }).populate(POPULATE); }
  findByUserRaw(userId)        { return Cart.findOne({ user: userId }); }
  create(userId)               { return Cart.create({ user: userId, items: [] }); }
  save(cart)                   { return cart.save(); }
  clear(userId)                { return Cart.findOneAndUpdate({ user: userId }, { items: [] }); }
}

module.exports = new CartRepository();
