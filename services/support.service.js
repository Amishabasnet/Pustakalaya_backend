const supportRepo          = require("../repositories/support.repository");
const { BadRequest, NotFound } = require("../errors/httpErrors");
const { PaginatedDTO }      = require("../dtos/admin.dto");

const VALID_ISSUE_TYPES  = ["damaged_book", "incorrect_book", "delayed_delivery", "payment_problem", "other"];
const VALID_SUPPORT_STATUSES = ["open", "in_review", "resolved", "closed"];
const RESOLVED_STATUSES  = ["resolved", "closed"];

class SupportService {
  async submitRequest(userId, dto) {
    if (!VALID_ISSUE_TYPES.includes(dto.issueType))
      throw BadRequest(`Invalid issue type. Must be one of: ${VALID_ISSUE_TYPES.join(", ")}`);
    if (!dto.description?.trim())
      throw BadRequest("Please describe your issue.");

    const request = await supportRepo.create({
      user:        userId,
      issueType:   dto.issueType,
      description: dto.description.trim(),
      email:       dto.email,
      phoneNumber: dto.phoneNumber,
      evidenceUrl: dto.evidenceUrl || null,
    });

    return request;
  }

  async getMyRequests(userId) {
    const requests = await supportRepo.findByUser(userId);
    return { requests };
  }

  async getRequest(requestId, userId) {
    const request = await supportRepo.findByIdAndUser(requestId, userId);
    if (!request) throw NotFound("Support request not found.");
    return request;
  }

  // Admin
  async getAllRequests({ page = 1, limit = 20, status, issueType }) {
    const query = {};
    if (status) query.status = status;
    if (issueType) query.issueType = issueType;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      supportRepo.findAllPaginated({ query, skip, limit: Number(limit) }),
      supportRepo.countAllFiltered(query),
    ]);

    return new PaginatedDTO(requests, total, Number(page), Number(limit));
  }

  async updateRequestAdmin(requestId, { status, adminNote }) {
    const request = await supportRepo.findById(requestId);
    if (!request) throw NotFound("Support request not found.");

    if (status) {
      if (!VALID_SUPPORT_STATUSES.includes(status))
        throw BadRequest(`Status must be one of: ${VALID_SUPPORT_STATUSES.join(", ")}`);
      request.status     = status;
      request.resolvedAt = RESOLVED_STATUSES.includes(status) ? (request.resolvedAt || new Date()) : null;
    }
    if (adminNote !== undefined) request.adminNote = adminNote?.trim() || null;

    await supportRepo.save(request);
    return request;
  }
}

module.exports = new SupportService();
