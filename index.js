const express      = require("express");
const path         = require("path");
const cors         = require("cors");
const cookieParser = require("cookie-parser");

const config          = require("./config/env");
const connectDB       = require("./database/connection");
const errorMiddleware = require("./middlewares/error.middleware");
const { authLimiter } = require("./middlewares/rateLimiter.middleware");

const authRoutes     = require("./routes/auth.routes");
const bookRoutes     = require("./routes/book.routes");
const cartRoutes     = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const orderRoutes    = require("./routes/order.routes");
const searchRoutes   = require("./routes/search.routes");
const referralRoutes = require("./routes/referral.routes");
const supportRoutes  = require("./routes/support.routes");
const adminRoutes    = require("./routes/admin.routes");
const reviewsRoutes  = require("./routes/reviews.routes");
const uploadRoutes   = require("./routes/upload.routes");

//  Connect Database 
connectDB();

const app = express();

//  Core Middleware 
const isAllowedOrigin = (origin) => {
  if (!origin) {
    return process.env.NODE_ENV === "development";
  }

  if (process.env.NODE_ENV === "development" && /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  if (origin === config.clientUrl) {
    return true;
  }

  if (config.clientUrl && config.clientUrl.includes("*")) {
    const escaped = config.clientUrl.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const pattern = escaped.replace(/\\\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(origin);
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//  Health Check 
app.get("/", (req, res) => {
  res.json({ success: true, message: "📚 Bookstore API is running", version: "2.0.0" });
});

//  Routes 
app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/books",    bookRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/checkout", orderRoutes);
app.use("/api/search",   searchRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/support",  supportRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/reviews",  reviewsRoutes);
app.use("/api/upload",   uploadRoutes);


//  404 Handler 
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

//  Global Error Handler 
app.use(errorMiddleware);

module.exports = app;
