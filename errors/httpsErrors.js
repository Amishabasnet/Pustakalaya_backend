const AppError = require("./AppError");

const BadRequest    = (msg) => new AppError(msg, 400);
const Unauthorized  = (msg) => new AppError(msg, 401);
const Forbidden     = (msg) => new AppError(msg, 403);
const NotFound      = (msg) => new AppError(msg, 404);
const Conflict      = (msg) => new AppError(msg, 409);
const Unprocessable = (msg) => new AppError(msg, 422);

module.exports = { BadRequest, Unauthorized, Forbidden, NotFound, Conflict, Unprocessable };
