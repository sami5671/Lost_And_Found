const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    primaryNumber: {
      type: String,
      trim: true,
    },
    alternativeNumber: {
      type: String,
      trim: true,
    },
    alternativeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    DOB: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "moderator"],
      default: "student",
    },
    providerId: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    idCardFront: {
      type: String,
      trim: true,
    },
    idCardBack: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    creditsCompleted: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    resetOTP: {
      type: String,
      trim: true,
    },
    resetOTPExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash passwords
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
