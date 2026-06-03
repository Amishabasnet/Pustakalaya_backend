const Referral = require("../models/Referral");

class ReferralRepository {
  findByReferrer(userId)   { return Referral.findOne({ referrer: userId }); }
  findByCode(code)         { return Referral.findOne({ referralCode: code }); }
  create(data)             { return Referral.create(data); }
  save(doc)                { return doc.save(); }
}

module.exports = new ReferralRepository();
