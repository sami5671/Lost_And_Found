const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    similarityScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "claimed", "verified", "dismissed"],
      default: "pending",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    claimedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Match", MatchSchema);
