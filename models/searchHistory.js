const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    queries: [
      {
        query:      { type: String, required: true, trim: true },
        searchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
