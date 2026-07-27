const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePassword, getAllUsers, forgotPassword, resetPassword } = require("../controllers/authController");
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
router.get("/users/all", verifyToken, getAllUsers);

module.exports = router;
