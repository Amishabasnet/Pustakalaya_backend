const bookRepo                      = require("../repositories/book.repository");
const userRepo                      = require("../repositories/user.repository");
const orderRepo                     = require("../repositories/order.repository");
const supportRepo                   = require("../repositories/support.repository");
const { NotFound, BadRequest }      = require("../errors/httpErrors");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../types/constants");
const { AdminUserDTO, PaginatedDTO }   = require("../dtos/admin.dto");

const toBool = (val) => {
  if (val === undefined) return undefined;
  if (typeof val === "boolean") return val;
  return val === "true";
};

class AdminService {
  // Dashboard
  async getDashboard() {
    const [
      totalBooks,
      totalUsers,
      totalOrders,
      revenueAgg,
      statusAgg,
      lowStockBooks,
      recentOrders,
      recentSupportRequests,
    ] = await Promise.all([
      bookRepo.countAllFiltered({}),
      userRepo.countAllFiltered({}),
      orderRepo.countAllFiltered({}),
      orderRepo.sumPaidRevenue(PAYMENT_STATUS.PAID),
      orderRepo.countGroupByStatus(),
      bookRepo.findLowStock(5, 10),
      orderRepo.findRecent(10),
      supportRepo.findRecent(10),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const ordersByStatus = Object.values(ORDER_STATUS).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});
    statusAgg.forEach(({ _id, count }) => {
      if (_id in ordersByStatus) ordersByStatus[_id] = count;
    });

    return {
      totalBooks,
      totalUsers,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      lowStockBooks,
      recentOrders,
      recentSupportRequests,
    };
  }

  // Users
  async getUsers({ page = 1, limit = 20, search, isActive }) {
    const query = {};
    if (search?.trim()) {
      const re = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: re }, { email: re }, { username: re }];
    }
    const activeFilter = toBool(isActive);
    if (activeFilter !== undefined) query.isActive = activeFilter;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      userRepo.findAllPaginated({ query, skip, limit: Number(limit) }),
      userRepo.countAllFiltered(query),
    ]);

    return new PaginatedDTO(users.map((u) => new AdminUserDTO(u)), total, Number(page), Number(limit));
  }

  async getUserDetail(id) {
    const user = await userRepo.findById(id);
    if (!user) throw NotFound("User not found.");

    const orders = await orderRepo.findByUserAdmin(id);
    return { ...new AdminUserDTO(user), orders };
  }

  async toggleUserStatus(id) {
    const user = await userRepo.findById(id);
    if (!user) throw NotFound("User not found.");

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    return new AdminUserDTO(user);
  }

  // Orders
  async getOrders({ page = 1, limit = 20, status, paymentStatus, search }) {
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search?.trim()) query.orderId = new RegExp(search.trim(), "i");

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      orderRepo.findAllPaginated({ query, skip, limit: Number(limit) }),
      orderRepo.countAllFiltered(query),
    ]);

    return new PaginatedDTO(orders, total, Number(page), Number(limit));
  }

  async updateOrderStatus(orderId, status, note) {
    if (!Object.values(ORDER_STATUS).includes(status))
      throw BadRequest(`Status must be one of: ${Object.values(ORDER_STATUS).join(", ")}`);

    const order = await orderRepo.findByOrderId(orderId);
    if (!order) throw NotFound("Order not found.");

    order.status = status;
    order.statusHistory.push({ status, note: note?.trim() || `Status updated to "${status}" by admin.` });

    if (status === ORDER_STATUS.CANCELLED && !order.cancelledAt) {
      order.cancelledAt  = new Date();
      order.cancelReason = note?.trim() || "Cancelled by admin.";
    }

    await orderRepo.save(order);
    return order;
  }

  // Books
  async getBooks({ page = 1, limit = 20, search, genre, verified }) {
    const query = {};
    if (search?.trim()) query.$text = { $search: search.trim() };
    if (genre) query.genre = genre;
    const verifiedFilter = toBool(verified);
    if (verifiedFilter !== undefined) query.isVerified = verifiedFilter;

    const skip = (Number(page) - 1) * Number(limit);
    const [books, total] = await Promise.all([
      bookRepo.findAllPaginated({ query, skip, limit: Number(limit) }),
      bookRepo.countAllFiltered(query),
    ]);

    return new PaginatedDTO(books, total, Number(page), Number(limit));
  }

  async toggleBookVerify(id) {
    const book = await bookRepo.findById(id);
    if (!book) throw NotFound("Book not found.");

    book.isVerified = !book.isVerified;
    await book.save();
    return book;
  }

  async toggleBookFeature(id) {
    const book = await bookRepo.findById(id);
    if (!book) throw NotFound("Book not found.");

    book.isFeatured = !book.isFeatured;
    await book.save();
    return book;
  }
}

module.exports = new AdminService();
