const { body, validationResult } = require("express-validator");

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

const signUpValidator = [
  body("fullName").trim().notEmpty().withMessage("Full name is required").isLength({ min: 2, max: 100 }).withMessage("Full name must be 2–100 characters"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required").matches(/^\d{10}$/).withMessage("Phone number must be exactly 10 digits"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").matches(/\d/).withMessage("Password must contain at least one number"),
  body("confirmPassword").notEmpty().withMessage("Please confirm your password").custom((val, { req }) => {
    if (val !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  handleErrors,
];

const signInValidator = [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleErrors,
];

const updateProfileValidator = [
  body("fullName").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Full name must be 2–100 characters"),
  body("username").optional().trim().isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters").matches(/^[a-z0-9_.]+$/).withMessage("Username can only contain letters, numbers, dots and underscores"),
  body("phoneNumber").optional().trim().matches(/^\d{10}$/).withMessage("Phone number must be exactly 10 digits"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("address").optional().trim().isLength({ max: 255 }).withMessage("Address must be under 255 characters"),
  body("newPassword").optional().isLength({ min: 6 }).withMessage("New password must be at least 6 characters").matches(/\d/).withMessage("New password must contain at least one number"),
  body("confirmNewPassword").optional().custom((val, { req }) => {
    if (req.body.newPassword && val !== req.body.newPassword) throw new Error("New passwords do not match");
    return true;
  }),
  handleErrors,
];

module.exports = { signUpValidator, signInValidator, updateProfileValidator };
