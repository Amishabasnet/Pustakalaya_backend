const jwt = require("jsonwebtoken");
const config = require("./env");

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

const cookieOptions = (maxAgeDays) => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
});

const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res
    .status(statusCode)
    .cookie("accessToken",  accessToken,  cookieOptions(7))
    .cookie("refreshToken", refreshToken, cookieOptions(30))
    .json({
      success: true,
      message,
      data: { user: user.toSafeObject(), accessToken },
    });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
