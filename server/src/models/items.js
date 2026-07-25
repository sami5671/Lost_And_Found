const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    locationLost: {
      type: String,
      required: true,
    },
    dateLost: {
      type: Date,
      required: true,
    },
    contactInfo: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      default: "lost",
    },
    status: {
      type: String,
      enum: ["reported", "matched", "resolved"],
      default: "reported",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", ItemSchema);
