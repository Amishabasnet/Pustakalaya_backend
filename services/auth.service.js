const userRepo                          = require("../repositories/user.repository");
const orderRepo                         = require("../repositories/order.repository");
const wishlistRepo                      = require("../repositories/wishlist.repository");
const { sendTokenResponse }             = require("../config/jwt");
const { Conflict, Unauthorized, Forbidden, BadRequest } = require("../errors/httpErrors");

class AuthService {
  async signUp(dto, res) {
    const existing = await userRepo.findByEmail(dto.email);
    if (existing) throw Conflict("An account with this email already exists.");

    const user = await userRepo.create({
      fullName:    dto.fullName,
      phoneNumber: dto.phoneNumber,
      email:       dto.email,
      password:    dto.password,
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

  async updateProfile(userId, dto) {
    const user = await userRepo.findByIdWithPass(userId);
    if (!user) throw Unauthorized("User not found.");

    // Update basic fields
    if (dto.fullName)    user.fullName    = dto.fullName;
    if (dto.username)    user.username    = dto.username;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;
    if (dto.address !== undefined) user.address = dto.address;

    // Email change — check uniqueness
    if (dto.email && dto.email !== user.email) {
      const exists = await userRepo.findByEmail(dto.email);
      if (exists) throw Conflict("This email is already in use.");
      user.email = dto.email;
    }

    // Password change
    if (dto.newPassword) {
      if (!dto.currentPassword) throw BadRequest("Current password is required to set a new password.");
      const match = await user.comparePassword(dto.currentPassword);
      if (!match) throw BadRequest("Current password is incorrect.");
      if (dto.newPassword !== dto.confirmNewPassword) throw BadRequest("New passwords do not match.");
      user.password = dto.newPassword; // hashed by pre-save hook
    }

    await user.save();
    return user.toSafeObject();
  }

  async getProfileStats(userId) {
    const [ordersCount, wishlist] = await Promise.all([
      orderRepo.countByUser(userId),
      wishlistRepo.findByUser(userId),
    ]);
    return {
      ordersPlaced:    ordersCount,
      booksWishlisted: wishlist ? wishlist.books.length : 0,
    };
  }
}

module.exports = new AuthService();
