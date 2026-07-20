const router         = require("express").Router();
const uploadCtrl     = require("../controllers/upload.controller");
const upload         = require("../middlewares/upload.middleware");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

router.post("/image", protect, isAdmin, upload.single("image"), uploadCtrl.uploadImage.bind(uploadCtrl));

module.exports = router;
