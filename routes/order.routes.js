const router      = require("express").Router();
const orderCtrl   = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
const { placeOrderValidator } = require("../validators/order.validator");

router.use(protect);

router.get ("/summary",                           orderCtrl.getCheckoutSummary.bind(orderCtrl));
router.post("/place-order", placeOrderValidator,  orderCtrl.placeOrder.bind(orderCtrl));
router.get ("/",                                  orderCtrl.getOrders.bind(orderCtrl));
router.get ("/:orderId",                          orderCtrl.getOrder.bind(orderCtrl));
router.patch("/:orderId/cancel",                  orderCtrl.cancelOrder.bind(orderCtrl));
router.patch("/:orderId/payment-verify",          orderCtrl.verifyPayment.bind(orderCtrl));

module.exports = router;
