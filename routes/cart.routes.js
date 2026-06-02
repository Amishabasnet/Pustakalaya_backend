const router   = require("express").Router();
const cartCtrl = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get   ("/",          cartCtrl.getCart.bind(cartCtrl));
router.delete("/",          cartCtrl.clearCart.bind(cartCtrl));
router.post  ("/:bookId",   cartCtrl.addToCart.bind(cartCtrl));
router.patch ("/:bookId",   cartCtrl.updateItem.bind(cartCtrl));
router.delete("/:bookId",   cartCtrl.removeItem.bind(cartCtrl));

module.exports = router;
