const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referralCode:   { type: String, required: true, unique: true },
    usedBy:         [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rewardEarned:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
