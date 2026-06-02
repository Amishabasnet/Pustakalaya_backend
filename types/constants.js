const ORDER_STATUS = Object.freeze({
  PLACED:     "placed",
  CONFIRMED:  "confirmed",
  PROCESSING: "processing",
  SHIPPED:    "shipped",
  DELIVERED:  "delivered",
  CANCELLED:  "cancelled",
});

const CANCELLABLE_STATUSES = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED];

const PAYMENT_STATUS = Object.freeze({
  PENDING:  "pending",
  PAID:     "paid",
  FAILED:   "failed",
  REFUNDED: "refunded",
});

const PAYMENT_METHODS = Object.freeze(["esewa", "khalti", "card", "cod"]);

const DELIVERY_OPTIONS = Object.freeze(["standard", "express"]);

const SORT_OPTIONS = Object.freeze({
  RELEVANCE:  "relevance",
  PRICE_ASC:  "price_asc",
  PRICE_DESC: "price_desc",
  RATING:     "rating",
  NEWEST:     "newest",
});

module.exports = {
  ORDER_STATUS,
  CANCELLABLE_STATUSES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  DELIVERY_OPTIONS,
  SORT_OPTIONS,
};
