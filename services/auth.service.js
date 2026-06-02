const userRepo                          = require("../repositories/user.repository");
const { sendTokenResponse }             = require("../config/jwt");
const { Conflict, Unauthorized, Forbidden } = require("../errors/httpErrors");

class AuthService {
  async signUp(dto, res) {
    const existing = await userRepo.findByEmail(dto.email);
    if (existing) throw Conflict("An account with this email already exists.");

    const user = await userRepo.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: dto.password,
    });

    sendTokenResponse(user, 201, res, "Account created successfully!");
  }

  async signIn(dto, res) {
    const user = await userRepo.findByEmailWithPass(dto.email);
    if (!user) throw Unauthorized("Invalid email or password.");
    if (!user.isActive) throw Forbidden("Your account has been deactivated.");

    const match = await user.comparePassword(dto.password);
    if (!match) throw Unauthorized("Invalid email or password.");

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Signed in successfully!");
  }

  signOut(res) {
    const expired = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", expires: new Date(0) };
    res.cookie("accessToken",  "", expired)
       .cookie("refreshToken", "", expired);
    return { message: "Signed out successfully." };
  }

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw Unauthorized("User not found.");
    return user.toSafeObject();
  }
}

module.exports = new AuthService();
