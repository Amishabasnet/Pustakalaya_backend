class CartResponseDTO {
  constructor(cart) {
    this.items      = cart ? cart.items : [];
    this.totalPrice = cart
      ? cart.items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0)
      : 0;
    this.totalItems = cart ? cart.items.length : 0;
  }
}

module.exports = { CartResponseDTO };
