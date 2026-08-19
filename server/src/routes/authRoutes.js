const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePassword, updateProfile, getAllUsers, forgotPassword, resetPassword, updateUserByAdmin, deleteUserByAdmin, purgeUserDataByAdmin } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadMiddleware");

// Public Routes
router.post("/auth/login", login);
router.post(
  "/auth/register",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  register
);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

// Private Routes (Require Token)
router.get("/auth/me", verifyToken, getMe);
router.patch("/user/updatePassword", verifyToken, updatePassword);
router.patch(
  "/user/updateProfile",
  verifyToken,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
  ]),
  updateProfile
);
router.get("/users/all", verifyToken, getAllUsers);
router.patch("/users/:id", verifyToken, updateUserByAdmin);
router.delete("/users/:id/purge", verifyToken, purgeUserDataByAdmin);
router.delete("/users/:id", verifyToken, deleteUserByAdmin);

module.exports = router;
