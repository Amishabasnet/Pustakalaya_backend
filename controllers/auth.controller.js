const authService             = require("../services/auth.service");
const { SignUpDTO, SignInDTO, UpdateProfileDTO } = require("../dtos/auth.dto");
const jwt                     = require("jsonwebtoken");
const config                  = require("../config/env");
const { generateAccessToken, generateRefreshToken } = require("../config/jwt");
const userRepo                = require("../repositories/user.repository");
const { Unauthorized }        = require("../errors/httpErrors");

class AuthController {
  async signUp(req, res, next) {
    try {
      const dto = new SignUpDTO(req.body);
      await authService.signUp(dto, res);
    } catch (err) { next(err); }
  }

  async signIn(req, res, next) {
    try {
      const dto = new SignInDTO(req.body);
      await authService.signIn(dto, res);
    } catch (err) { next(err); }
  }

  signOut(req, res, next) {
    try {
      authService.signOut(res);
      res.status(200).json({ success: true, message: "Signed out successfully." });
    } catch (err) { next(err); }
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) throw Unauthorized("No refresh token provided.");

      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      const user    = await userRepo.findById(decoded.id);
      if (!user || !user.isActive) throw Unauthorized("Invalid refresh token.");

      const accessToken  = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res
        .cookie("accessToken",  accessToken,  { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "strict", maxAge: 7  * 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: config.nodeEnv === "production", sameSite: "strict", maxAge: 30 * 24 * 60 * 60 * 1000 })
        .status(200)
        .json({ success: true, message: "Token refreshed.", data: { accessToken } });
    } catch (err) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
        return next(Unauthorized("Invalid or expired refresh token."));
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user._id);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) { next(err); }
  }

  async updateProfile(req, res, next) {
    try {
      const dto  = new UpdateProfileDTO(req.body);
      const user = await authService.updateProfile(req.user._id, dto);
      res.status(200).json({ success: true, message: "Profile updated successfully.", data: { user } });
    } catch (err) { next(err); }
  }

  async getProfileStats(req, res, next) {
    try {
      const stats = await authService.getProfileStats(req.user._id);
      res.status(200).json({ success: true, data: stats });
    } catch (err) { next(err); }
  }
}

module.exports = new AuthController();
