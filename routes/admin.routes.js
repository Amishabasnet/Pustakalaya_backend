const router       = require("express").Router();
const adminCtrl    = require("../controllers/admin.controller");
const supportCtrl  = require("../controllers/support.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");
const { updateOrderStatusValidator, updateSupportRequestValidator } = require("../validators/admin.validator");

router.use(protect, isAdmin);

// Dashboard 
router.get("/dashboard", adminCtrl.getDashboard.bind(adminCtrl));

// Users 
router.get  ("/users",             adminCtrl.getUsers.bind(adminCtrl));
router.get  ("/users/:id",         adminCtrl.getUserDetail.bind(adminCtrl));
router.patch("/users/:id/status",  adminCtrl.toggleUserStatus.bind(adminCtrl));

// Orders 
router.get  ("/orders",                                        adminCtrl.getOrders.bind(adminCtrl));
router.patch("/orders/:orderId/status", updateOrderStatusValidator, adminCtrl.updateOrderStatus.bind(adminCtrl));

// Books 
router.get  ("/books",              adminCtrl.getBooks.bind(adminCtrl));
router.patch("/books/:id/verify",   adminCtrl.toggleBookVerify.bind(adminCtrl));
router.patch("/books/:id/feature",  adminCtrl.toggleBookFeature.bind(adminCtrl));

// Support 
router.get  ("/support",             supportCtrl.getAllRequests.bind(supportCtrl));
router.patch("/support/:requestId", updateSupportRequestValidator, supportCtrl.updateRequest.bind(supportCtrl));

module.exports = router;
