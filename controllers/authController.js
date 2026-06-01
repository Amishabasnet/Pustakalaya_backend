const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendTokenResponse, generateAccessToken, generateRefreshToken } = require("../config/jwt");

// POST /api/auth/signup 
const signUp = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create new user (password hashed via pre-save hook in model)
    const user = await User.create({ fullName, phoneNumber, email, password });

    sendTokenResponse(user, 201, res, "Account created successfully!");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/signin 
const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field (excluded by default via `select: false`)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Signed in successfully!");
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/signout 
const signOut = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0), // Immediately expire cookies
  };

  res
    .cookie("accessToken", "", cookieOptions)
    .cookie("refreshToken", "", cookieOptions)
    .status(200)
    .json({ success: true, message: "Signed out successfully." });
};

// POST /api/auth/refresh 
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res
      .cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Token refreshed.",
        data: { accessToken: newAccessToken },
      });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please sign in again.",
      });
    }
    next(error);
  }
};

// GET /api/auth/me 
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
};

module.exports = { signUp, signIn, signOut, refreshToken, getMe };
