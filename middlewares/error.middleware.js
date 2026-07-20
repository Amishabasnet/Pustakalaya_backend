const config = require("../config/env");

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || "Internal Server Error";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message     = `A record with that ${field} already exists.`;
    statusCode  = 409;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    const summary = errors.map((e) => e.message).join(" ");
    return res.status(422).json({ success: false, message: summary || "Validation failed", errors });
  }

  // Multer upload errors
  if (err.name === "MulterError") {
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5MB." : err.message;
    statusCode = 400;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message    = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  if (config.nodeEnv === "development") console.error("🔴", err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
