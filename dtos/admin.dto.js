// Admin User DTO
class AdminUserDTO {
  constructor(user) {
    this._id = user._id;
    this.fullName = user.fullName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.status = user.status;
    this.createdAt = user.createdAt;
  }
}

// Paginated DTO
class PaginatedDTO {
  constructor(data, total, page, limit) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

module.exports = { AdminUserDTO, PaginatedDTO };
