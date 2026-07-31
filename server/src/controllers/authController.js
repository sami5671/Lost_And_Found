const User = require("../models/users");
const jwt = require("jsonwebtoken");
const { apiResponse } = require("../helpers");
const { uploadToCloudinary, deleteFromCloudinary } = require("../helpers/cloudinaryHelper");
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
    studentId: user.studentId,
    creditsCompleted: user.creditsCompleted,
    bloodGroup: user.bloodGroup,
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
      studentId,
      creditsCompleted,
      bloodGroup,
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
      const frontFile = (req.files.idFront && req.files.idFront[0]) || (req.files.idCardFront && req.files.idCardFront[0]);
      if (frontFile) {
        idCardFrontUrl = await uploadToCloudinary(
          frontFile.buffer,
          frontFile.originalname,
          "ID_Cards"
        );
      }
      const backFile = (req.files.idBack && req.files.idBack[0]) || (req.files.idCardBack && req.files.idCardBack[0]);
      if (backFile) {
        idCardBackUrl = await uploadToCloudinary(
          backFile.buffer,
          backFile.originalname,
          "ID_Cards"
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
      studentId,
      creditsCompleted,
      bloodGroup,
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

    if (user.status === "Inactive") {
      return apiResponse(res, 403, false, "Your account has been deactivated. Please contact the system administrator.");
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
          status: user.status || "Active",
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

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.decoded?.id;
    if (!userId) {
      return apiResponse(res, 401, false, "Unauthorized access! User token required.");
    }

    const {
      fullName,
      primaryNumber,
      alternativeNumber,
      alternativeEmail,
      occupation,
      gender,
      DOB,
      address,
      studentId,
      creditsCompleted,
      bloodGroup,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, "User account not found!");
    }

    // Extract uploaded files from req.files or req.file
    const avatarFile = req.files?.avatar?.[0] || (req.file?.fieldname === "avatar" ? req.file : null);
    const idFrontFile = req.files?.idCardFront?.[0] || req.files?.idFront?.[0] || (req.file?.fieldname === "idCardFront" || req.file?.fieldname === "idFront" ? req.file : null);
    const idBackFile = req.files?.idCardBack?.[0] || req.files?.idBack?.[0] || (req.file?.fieldname === "idCardBack" || req.file?.fieldname === "idBack" ? req.file : null);

    // Handle profile picture update & delete previous picture from Cloudinary
    if (avatarFile) {
      if (user.avatar) {
        await deleteFromCloudinary(user.avatar);
      }
      const newAvatarUrl = await uploadToCloudinary(
        avatarFile.buffer,
        avatarFile.originalname,
        "Avatars"
      );
      user.avatar = newAvatarUrl;
    }

    // Handle ID Card Front update & delete previous from Cloudinary
    if (idFrontFile) {
      if (user.idCardFront) {
        await deleteFromCloudinary(user.idCardFront);
      }
      const newIdFrontUrl = await uploadToCloudinary(
        idFrontFile.buffer,
        idFrontFile.originalname,
        "ID_Cards"
      );
      user.idCardFront = newIdFrontUrl;
    }

    // Handle ID Card Back update & delete previous from Cloudinary
    if (idBackFile) {
      if (user.idCardBack) {
        await deleteFromCloudinary(user.idCardBack);
      }
      const newIdBackUrl = await uploadToCloudinary(
        idBackFile.buffer,
        idBackFile.originalname,
        "ID_Cards"
      );
      user.idCardBack = newIdBackUrl;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (primaryNumber !== undefined) user.primaryNumber = primaryNumber;
    if (alternativeNumber !== undefined) user.alternativeNumber = alternativeNumber;
    if (alternativeEmail !== undefined) user.alternativeEmail = alternativeEmail;
    if (occupation !== undefined) user.occupation = occupation;
    if (gender !== undefined) user.gender = gender;
    if (DOB !== undefined) user.DOB = DOB;
    if (address !== undefined) user.address = address;
    if (studentId !== undefined) user.studentId = studentId;
    if (creditsCompleted !== undefined) user.creditsCompleted = creditsCompleted;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;

    await user.save();

    return apiResponse(res, 200, true, "Profile updated successfully!", {
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateUserByAdmin = async (req, res, next) => {
  try {
    const requesterRole = req.decoded?.role;
    if (requesterRole !== "admin") {
      return apiResponse(res, 403, false, "Forbidden: Admin access required");
    }

    const { id } = req.params;
    const {
      fullName,
      email,
      primaryNumber,
      alternativeNumber,
      alternativeEmail,
      occupation,
      gender,
      DOB,
      address,
      role,
      studentId,
      creditsCompleted,
      bloodGroup,
      status,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail && existingEmail._id.toString() !== id) {
        return apiResponse(res, 400, false, "Email is already registered by another user!");
      }
      user.email = email.toLowerCase().trim();
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (primaryNumber !== undefined) user.primaryNumber = primaryNumber;
    if (alternativeNumber !== undefined) user.alternativeNumber = alternativeNumber;
    if (alternativeEmail !== undefined) user.alternativeEmail = alternativeEmail;
    if (occupation !== undefined) user.occupation = occupation;
    if (gender !== undefined) user.gender = gender;
    if (DOB !== undefined) user.DOB = DOB;
    if (address !== undefined) user.address = address;
    if (role !== undefined) user.role = role;
    if (studentId !== undefined) user.studentId = studentId;
    if (creditsCompleted !== undefined) user.creditsCompleted = creditsCompleted;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (status !== undefined) user.status = status;

    await user.save();

    const Item = require("../models/items");
    const itemCount = await Item.countDocuments({ reportedBy: user._id });

    return apiResponse(res, 200, true, "User updated successfully", {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        primaryNumber: user.primaryNumber,
        alternativeNumber: user.alternativeNumber,
        alternativeEmail: user.alternativeEmail,
        occupation: user.occupation,
        gender: user.gender,
        DOB: user.DOB,
        address: user.address,
        avatar: user.avatar,
        studentId: user.studentId,
        creditsCompleted: user.creditsCompleted,
        bloodGroup: user.bloodGroup,
        items: itemCount,
        status: user.status || "Active",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserByAdmin = async (req, res, next) => {
  try {
    const requesterRole = req.decoded?.role;
    const requesterId = req.decoded?.id;

    if (requesterRole !== "admin") {
      return apiResponse(res, 403, false, "Forbidden: Admin access required");
    }

    const { id } = req.params;

    if (requesterId === id) {
      return apiResponse(res, 400, false, "You cannot deactivate your own admin account!");
    }

    const user = await User.findById(id);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    // Soft delete: toggle or set status to Inactive
    const newStatus = user.status === "Inactive" ? "Active" : "Inactive";
    user.status = newStatus;
    await user.save();

    const actionText = newStatus === "Inactive" ? "deactivated" : "reactivated";

    return apiResponse(res, 200, true, `User account ${actionText} successfully`, {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  updateProfile,
  getAllUsers,
  forgotPassword,
  resetPassword,
  updateUserByAdmin,
  deleteUserByAdmin,
};

