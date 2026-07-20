const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const { BadRequest } = require("../errors/httpErrors");

const uploadDir = path.join(__dirname, "..", "uploads", "covers");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const allowedTypes = /jpeg|jpg|png|webp|gif/;

const fileFilter = (req, file, cb) => {
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(BadRequest("Only image files (jpeg, jpg, png, webp, gif) are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
