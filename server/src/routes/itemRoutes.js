const express = require("express");
const router = express.Router();
const { 
  reportLostItem, 
  getMyStats, 
  getMyItems, 
  reportFoundItem, 
  getAllItems, 
  getAdminStats,
  getMatches,
  approveMatch,
  dismissMatch,
  verifyOwner,
  checkOwnerMatch,
  getGlobalStats
} = require("../controllers/itemController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadMiddleware");

router.post(
  "/items/report-lost",
  verifyToken,
  upload.array("images", 10), // Support up to 10 images
  reportLostItem
);

router.post(
  "/items/report-found",
  verifyToken,
  upload.array("images", 10), // Support up to 10 images
  reportFoundItem
);

router.get("/items/my-stats", verifyToken, getMyStats);
router.get("/items/my-items", verifyToken, getMyItems);
router.get("/items/all", verifyToken, getAllItems);
router.get("/items/admin/stats", verifyToken, getAdminStats);
router.get("/items/global-stats", getGlobalStats);

// AI Matches Routes
router.get("/items/matches", verifyToken, getMatches);
router.patch("/items/matches/:id/approve", verifyToken, approveMatch);
router.patch("/items/matches/:id/dismiss", verifyToken, dismissMatch);
router.post("/items/found/:id/verify-owner", verifyToken, verifyOwner);
router.get("/items/found/:id/check-match", verifyToken, checkOwnerMatch);

module.exports = router;
