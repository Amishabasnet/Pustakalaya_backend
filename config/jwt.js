const jwt = require("jsonwebtoken");

// Generate an access token (short-lived)  
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Generate a refresh token (long-lived)

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// Send tokens as HTTP-only cookies + JSON response
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,                               // Not accessible via JS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",
  };

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    })
    .json({
      success: true,
      message,
      data: {
        user: user.toSafeObject(),
        accessToken, // Also send in body for clients that prefer headers
      },
    });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
