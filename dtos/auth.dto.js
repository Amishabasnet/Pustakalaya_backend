//Request DTOs 

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

//Response DTOs 

class UserResponseDTO {
  constructor(user) {
    this._id         = user._id;
    this.fullName    = user.fullName;
    this.phoneNumber = user.phoneNumber;
    this.email       = user.email;
    this.isActive    = user.isActive;
    this.lastLogin   = user.lastLogin;
    this.createdAt   = user.createdAt;
  }
}

module.exports = { SignUpDTO, SignInDTO, UserResponseDTO };
