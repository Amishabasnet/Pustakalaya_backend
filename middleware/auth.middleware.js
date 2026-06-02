const jwt        = require("jsonwebtoken");
const config     = require("../config/env");
const userRepo   = require("../repositories/user.repository");
const { Unauthorized, Forbidden } = require("../errors/httpErrors");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies?.accessToken)
      token = req.cookies.accessToken;

    if (!token) return next(Unauthorized("Access denied. No token provided."));

    const decoded = jwt.verify(token, config.jwt.secret);
    const user    = await userRepo.findById(decoded.id);

    if (!user)          return next(Unauthorized("User no longer exists."));
    if (!user.isActive) return next(Forbidden("Your account has been deactivated."));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") return next(Unauthorized("Invalid token."));
    if (err.name === "TokenExpiredError") return next(Unauthorized("Token expired."));
    next(err);
  }
};

// Attach user if token present, but don't block if absent
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies?.accessToken)
      token = req.cookies.accessToken;

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user    = await userRepo.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch (_) { next(); }
};

module.exports = { protect, optionalAuth };
