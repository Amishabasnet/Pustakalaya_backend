const cartRepo             = require("../repositories/cart.repository");
const bookRepo             = require("../repositories/book.repository");
const { NotFound, BadRequest } = require("../errors/httpErrors");
const { CartResponseDTO }  = require("../dtos/cart.dto");

class CartService {
  async getCart(userId) {
    const cart = await cartRepo.findByUser(userId);
    return new CartResponseDTO(cart);
  }

  async addToCart(userId, bookId, quantity = 1) {
    const book = await bookRepo.findById(bookId);
    if (!book)              throw NotFound("Book not found.");
    if (book.stock < quantity) throw BadRequest("Not enough stock available.");

    let cart = await cartRepo.findByUserRaw(userId);
    if (!cart) cart = await cartRepo.create(userId);

    const existing = cart.items.find((i) => i.book.toString() === bookId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (book.stock < newQty) throw BadRequest("Not enough stock available.");
      existing.quantity = newQty;
    } else {
      cart.items.push({ book: bookId, quantity, priceAtAdd: book.price });
    }
    await cartRepo.save(cart);
    return { totalItems: cart.items.length };
  }

  async updateItem(userId, bookId, quantity) {
    if (!quantity || quantity < 1) throw BadRequest("Quantity must be at least 1.");

    const cart = await cartRepo.findByUserRaw(userId);
    if (!cart) throw NotFound("Cart not found.");

    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item)  throw NotFound("Item not in cart.");

    const book = await bookRepo.findById(bookId);
    if (book.stock < quantity) throw BadRequest("Not enough stock available.");

    item.quantity = quantity;
    await cartRepo.save(cart);
  }

  async removeItem(userId, bookId) {
    const cart = await cartRepo.findByUserRaw(userId);
    if (!cart) throw NotFound("Cart not found.");
    cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
    await cartRepo.save(cart);
    return { totalItems: cart.items.length };
  }

  async clearCart(userId) {
    await cartRepo.clear(userId);
  }
}

module.exports = new CartService();
