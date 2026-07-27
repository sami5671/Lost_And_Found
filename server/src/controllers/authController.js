const User = require("../models/users");
const jwt = require("jsonwebtoken");
const { apiResponse } = require("../helpers");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const { sendPasswordResetOTP } = require("../helpers/emailService");

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15d",
    }
  );
};

// Clean user object to return to client
const sanitizeUser = (user) => {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    primaryNumber: user.primaryNumber,
    alternativeNumber: user.alternativeNumber,
    alternativeEmail: user.alternativeEmail,
    occupation: user.occupation,
    gender: user.gender,
    DOB: user.DOB,
    address: user.address,
    avatar: user.avatar,
    role: user.role,
    idCardFront: user.idCardFront,
    idCardBack: user.idCardBack,
  };
};

const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      primaryNumber,
      alternativeNumber,
      alternativeEmail,
      password,
      occupation,
      gender,
      DOB,
      address,
      avatar,
      role,
    } = req.body;

    if (!fullName || !email || !password) {
      return apiResponse(res, 400, false, "Full name, email and password are required!");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponse(res, 400, false, "Email is already registered!");
    }

    // Process file uploads if files exist
    let idCardFrontUrl = "";
    let idCardBackUrl = "";
    let avatarUrl = avatar || "";

    if (req.files) {
      if (req.files.idFront && req.files.idFront[0]) {
        idCardFrontUrl = await uploadToCloudinary(
          req.files.idFront[0].buffer,
          req.files.idFront[0].originalname
        );
      }
      if (req.files.idBack && req.files.idBack[0]) {
        idCardBackUrl = await uploadToCloudinary(
          req.files.idBack[0].buffer,
          req.files.idBack[0].originalname
        );
      }
      if (req.files.avatar && req.files.avatar[0]) {
        avatarUrl = await uploadToCloudinary(
          req.files.avatar[0].buffer,
          req.files.avatar[0].originalname,
          "Avatars"
        );
      }
    }

    const user = new User({
      fullName,
      email,
      primaryNumber,
      alternativeNumber,
      alternativeEmail,
      password,
      occupation,
      gender,
      DOB,
      address,
      avatar: avatarUrl,
      role: role || "student",
      idCardFront: idCardFrontUrl,
      idCardBack: idCardBackUrl,
    });

    await user.save();
    const token = generateToken(user);

    return apiResponse(res, 201, true, "Registration successful!", {
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, false, "Email and password are required!");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse(res, 401, false, "Invalid email or password!");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return apiResponse(res, 401, false, "Invalid email or password!");
    }

    const token = generateToken(user);

    return apiResponse(res, 200, true, "Login successful!", {
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.decoded?.id;
    if (!userId) {
      return apiResponse(res, 401, false, "Unauthorized: Invalid token payload");
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    return apiResponse(res, 200, true, "User profile retrieved successfully", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.decoded?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return apiResponse(res, 401, false, "Unauthorized!");
    }

    if (!oldPassword || !newPassword) {
      return apiResponse(res, 400, false, "Old password and new password are required!");
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, "User not found!");
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return apiResponse(res, 400, false, "Incorrect old password!");
    }

    user.password = newPassword;
    await user.save();

    return apiResponse(res, 200, true, "Password updated successfully!");
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const requesterRole = req.decoded?.role;
    if (requesterRole !== "admin") {
      return apiResponse(res, 403, false, "Forbidden: Admin access required");
    }

    const users = await User.find({}).sort({ createdAt: -1 });
    const Item = require("../models/items");

    const usersWithItemCount = await Promise.all(
      users.map(async (user) => {
        const itemCount = await Item.countDocuments({ reportedBy: user._id });
        return {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          primaryNumber: user.primaryNumber,
          occupation: user.occupation,
          gender: user.gender,
          DOB: user.DOB,
          address: user.address,
          avatar: user.avatar,
          items: itemCount,
          status: "Active",
          createdAt: user.createdAt,
        };
      })
    );

    return apiResponse(res, 200, true, "Users retrieved successfully", {
      users: usersWithItemCount,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return apiResponse(res, 400, false, "Email address is required!");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return apiResponse(res, 404, false, "No account found with this email address!");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    await user.save();

    await sendPasswordResetOTP(user.email, user.fullName, otp);

    return apiResponse(res, 200, true, "Password reset OTP sent to your email address!", {
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return apiResponse(res, 400, false, "Email, OTP code, and new password are required!");
    }

    if (newPassword.length < 6) {
      return apiResponse(res, 400, false, "Password must be at least 6 characters long!");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return apiResponse(res, 404, false, "Account not found!");
    }

    if (!user.resetOTP || user.resetOTP !== otp.toString().trim()) {
      return apiResponse(res, 400, false, "Invalid OTP verification code!");
    }

    if (user.resetOTPExpires && user.resetOTPExpires < Date.now()) {
      return apiResponse(res, 400, false, "OTP verification code has expired! Please request a new code.");
    }

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    return apiResponse(res, 200, true, "Password reset successful! You can now log in with your new password.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  getAllUsers,
  forgotPassword,
  resetPassword,
};
