const referralService = require("../services/referral.service");

class ReferralController {
  async getMyCode(req, res, next) {
    try {
      const data = await referralService.getOrCreateReferralCode(req.user._id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async applyCode(req, res, next) {
    try {
      const data = await referralService.applyReferralCode(req.user._id, req.body.code);
      res.status(200).json({ success: true, ...data });
    } catch (err) { next(err); }
  }
}

module.exports = new ReferralController();
