const express      = require("express");
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


//  Connect Database 
connectDB();

const app = express();

//  Core Middleware 
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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


//  404 Handler 
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

//  Global Error Handler 
app.use(errorMiddleware);

module.exports = app;
