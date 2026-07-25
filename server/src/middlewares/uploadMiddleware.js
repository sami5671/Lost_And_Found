const multer = require("multer");

// Use memory storage to store files as buffers before streaming to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // Limit to 8MB
  },
});

module.exports = upload;
