const router          = require("express").Router();
const authController  = require("../controllers/auth.controller");
const { protect }     = require("../middlewares/auth.middleware");
const { signUpValidator, signInValidator } = require("../validators/auth.validator");

router.post("/signup",  signUpValidator, (req, res, next) => authController.signUp(req, res, next));
router.post("/signin",  signInValidator, (req, res, next) => authController.signIn(req, res, next));
router.post("/signout",                 (req, res, next) => authController.signOut(req, res, next));
router.post("/refresh",                 (req, res, next) => authController.refresh(req, res, next));
router.get ("/me",      protect,        (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
