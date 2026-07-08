const config = require("../config/env");

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message   || "Internal Server Error";

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message     = `An account with that ${field} already exists.`;
    statusCode  = 409;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ success: false, message: "Validation failed", errors });
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
