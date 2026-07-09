const { body, validationResult } = require("express-validator");
const { ORDER_STATUS } = require("../types/constants");

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

const updateOrderStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(Object.values(ORDER_STATUS)).withMessage(`Status must be one of: ${Object.values(ORDER_STATUS).join(", ")}`),
  body("note").optional().trim().isLength({ max: 500 }).withMessage("Note must be under 500 characters"),
  handleErrors,
];

const updateSupportRequestValidator = [
  body("status").optional().isIn(["open", "in_review", "resolved", "closed"]).withMessage("Invalid status"),
  body("adminNote").optional().trim().isLength({ max: 2000 }).withMessage("Admin note must be under 2000 characters"),
  handleErrors,
];

module.exports = { updateOrderStatusValidator, updateSupportRequestValidator };
