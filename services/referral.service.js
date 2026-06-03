const referralRepo = require("../repositories/referral.repository");
const userRepo     = require("../repositories/user.repository");
const { BadRequest, NotFound } = require("../errors/httpErrors");
const crypto       = require("crypto");

class ReferralService {
  async getOrCreateReferralCode(userId) {
    let referral = await referralRepo.findByReferrer(userId);
    if (!referral) {
      const user = await userRepo.findById(userId);
      const base = (user?.username || user?.fullName || "user").replace(/\s+/g, "").toLowerCase().slice(0, 8);
      const code = `${base}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      referral = await referralRepo.create({ referrer: userId, referralCode: code });
    }
    return {
      referralCode: referral.referralCode,
      timesUsed:    referral.usedBy.length,
      rewardEarned: referral.rewardEarned,
    };
  }

  async applyReferralCode(userId, code) {
    const referral = await referralRepo.findByCode(code);
    if (!referral) throw NotFound("Invalid referral code.");
    if (referral.referrer.toString() === userId.toString())
      throw BadRequest("You cannot use your own referral code.");
    if (referral.usedBy.map(String).includes(userId.toString()))
      throw BadRequest("You have already used this referral code.");

    referral.usedBy.push(userId);
    referral.rewardEarned += 50; // NRs. 50 reward per referral
    await referralRepo.save(referral);

    return { message: "Referral code applied successfully! NRs. 50 reward added to referrer." };
  }
}

module.exports = new ReferralService();
