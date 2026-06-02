const Cart = require("../models/Cart");
const Book = require("../models/Book");

//  GET /api/cart 
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book",
      "title author price coverImage stock"
    );

    const items = cart ? cart.items : [];
    const totalPrice = items.reduce(
      (sum, item) => sum + item.priceAtAdd * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: { items, totalPrice, totalItems: items.length },
    });
  } catch (error) {
    next(error);
  }
};

//  POST /api/cart/:bookId 
const addToCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }
    if (book.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ book: bookId, quantity, priceAtAdd: book.price }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.book.toString() === bookId
      );

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (book.stock < newQty) {
          return res.status(400).json({ success: false, message: "Not enough stock available." });
        }
        existingItem.quantity = newQty;
      } else {
        cart.items.push({ book: bookId, quantity, priceAtAdd: book.price });
      }

      await cart.save();
    }

    res.status(200).json({ success: true, message: "Added to cart.", data: { totalItems: cart.items.length } });
  } catch (error) {
    next(error);
  }
};

//  PATCH /api/cart/:bookId 
const updateCartItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart." });
    }

    const book = await Book.findById(bookId).select("stock");
    if (book.stock < quantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart updated." });
  } catch (error) {
    next(error);
  }
};

//  DELETE /api/cart/:bookId 
const removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
    await cart.save();

    res.status(200).json({ success: true, message: "Item removed from cart.", data: { totalItems: cart.items.length } });
  } catch (error) {
    next(error);
  }
};

//  DELETE /api/cart 
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Cart cleared." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
