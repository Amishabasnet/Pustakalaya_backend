const router          = require("express").Router();
const referralCtrl    = require("../controllers/referral.controller");
const { protect }     = require("../middlewares/auth.middleware");
const { body, validationResult } = require("express-validator");

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  next();
};

router.use(protect);

router.get ("/my-code",   referralCtrl.getMyCode.bind(referralCtrl));
router.post("/apply", [body("code").notEmpty().withMessage("Referral code is required"), handleErrors], referralCtrl.applyCode.bind(referralCtrl));

module.exports = router;
