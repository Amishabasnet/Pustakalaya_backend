const { body, validationResult } = require("express-validator");
const { PAYMENT_METHODS, DELIVERY_OPTIONS } = require("../types");

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const placeOrderValidator = [
  body("deliveryAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("deliveryAddress.phone").trim().notEmpty().withMessage("Phone is required"),
  body("deliveryAddress.street").trim().notEmpty().withMessage("Street is required"),
  body("deliveryAddress.city").trim().notEmpty().withMessage("City is required"),
  body("deliveryOption").optional().isIn(DELIVERY_OPTIONS).withMessage(`Delivery option must be one of: ${DELIVERY_OPTIONS.join(", ")}`),
  body("paymentMethod").notEmpty().withMessage("Payment method is required").isIn(PAYMENT_METHODS).withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),
  handleErrors,
];

module.exports = { placeOrderValidator };
