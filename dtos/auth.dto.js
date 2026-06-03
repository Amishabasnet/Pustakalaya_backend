// request DTO
class SignUpDTO {
  constructor({ fullName, phoneNumber, email, password, confirmPassword }) {
    this.fullName        = fullName?.trim();
    this.phoneNumber     = phoneNumber?.trim();
    this.email           = email?.trim().toLowerCase();
    this.password        = password;
    this.confirmPassword = confirmPassword;
  }
}

class SignInDTO {
  constructor({ email, password }) {
    this.email    = email?.trim().toLowerCase();
    this.password = password;
  }
}

class UpdateProfileDTO {
  constructor({ fullName, username, phoneNumber, address, email, currentPassword, newPassword, confirmNewPassword }) {
    this.fullName           = fullName?.trim();
    this.username           = username?.trim().toLowerCase();
    this.phoneNumber        = phoneNumber?.trim();
    this.address            = address?.trim();
    this.email              = email?.trim().toLowerCase();
    this.currentPassword    = currentPassword;
    this.newPassword        = newPassword;
    this.confirmNewPassword = confirmNewPassword;
  }
}

// Response DTOs 
class UserResponseDTO {
  constructor(user) {
    this._id         = user._id;
    this.fullName    = user.fullName;
    this.username    = user.username;
    this.phoneNumber = user.phoneNumber;
    this.email       = user.email;
    this.address     = user.address;
    this.isActive    = user.isActive;
    this.lastLogin   = user.lastLogin;
    this.createdAt   = user.createdAt;
  }
}

module.exports = { SignUpDTO, SignInDTO, UpdateProfileDTO, UserResponseDTO };
