class PlaceOrderDTO {
  constructor({ deliveryAddress, deliveryOption, paymentMethod }) {
    this.deliveryAddress = deliveryAddress;
    this.deliveryOption  = deliveryOption || "standard";
    this.paymentMethod   = paymentMethod;
  }
}

class OrderResponseDTO {
  constructor(order) {
    this.orderId           = order.orderId;
    this.status            = order.status;
    this.paymentMethod     = order.paymentMethod;
    this.paymentStatus     = order.paymentStatus;
    this.subtotal          = order.subtotal;
    this.deliveryCharge    = order.deliveryCharge;
    this.total             = order.total;
    this.deliveryOption    = order.deliveryOption;
    this.estimatedDelivery = order.estimatedDelivery;
    this.deliveryAddress   = order.deliveryAddress;
    this.items             = order.items;
    this.statusHistory     = order.statusHistory;
    this.cancelReason      = order.cancelReason;
    this.createdAt         = order.createdAt;
  }
}

class OrderConfirmationDTO {
  constructor(order) {
    this.orderId           = order.orderId;
    this.total             = order.total;
    this.paymentMethod     = order.paymentMethod;
    this.status            = order.status;
    this.estimatedDelivery = order.estimatedDelivery;
  }
}

module.exports = { PlaceOrderDTO, OrderResponseDTO, OrderConfirmationDTO };
