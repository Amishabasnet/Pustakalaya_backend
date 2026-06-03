const supportRepo          = require("../repositories/support.repository");
const { BadRequest, NotFound } = require("../errors/httpErrors");

const VALID_ISSUE_TYPES = ["damaged_book", "incorrect_book", "delayed_delivery", "payment_problem", "other"];

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
}

module.exports = new SupportService();
