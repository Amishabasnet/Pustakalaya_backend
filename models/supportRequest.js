const mongoose = require("mongoose");

const ISSUE_TYPES = ["damaged_book", "incorrect_book", "delayed_delivery", "payment_problem", "other"];
const SUPPORT_STATUS = ["open", "in_review", "resolved", "closed"];

const supportRequestSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order:       { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    issueType:   { type: String, enum: ISSUE_TYPES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    email:       { type: String, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true },
    evidenceUrl: { type: String, default: null },
    status:      { type: String, enum: SUPPORT_STATUS, default: "open" },
    adminNote:   { type: String, default: null },
    resolvedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportRequest", supportRequestSchema);
