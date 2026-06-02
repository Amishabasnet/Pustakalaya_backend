const router       = require("express").Router();
const wishlistCtrl = require("../controllers/wishlist.controller");
const { protect }  = require("../middlewares/auth.middleware");

router.use(protect);

router.get ("/"         , wishlistCtrl.getWishlist.bind(wishlistCtrl));
router.post("/:bookId"  , wishlistCtrl.toggleWishlist.bind(wishlistCtrl));

module.exports = router;
