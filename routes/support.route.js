const router         = require("express").Router();
const supportCtrl    = require("../controllers/support.controller");
const { protect }    = require("../middlewares/auth.middleware");
const { body, validationResult } = require("express-validator");

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, message: "Validation failed", errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  next();
};

const submitValidator = [
  body("issueType").notEmpty().withMessage("Issue type is required"),
  body("description").notEmpty().withMessage("Description is required").isLength({ min: 10, max: 2000 }).withMessage("Description must be 10–2000 characters"),
  body("email").optional().isEmail().withMessage("Enter a valid email"),
  handleErrors,
];

router.use(protect);

router.post("/",               submitValidator, supportCtrl.submitRequest.bind(supportCtrl));
router.get ("/",                               supportCtrl.getMyRequests.bind(supportCtrl));
router.get ("/:requestId",                     supportCtrl.getRequest.bind(supportCtrl));

module.exports = router;
