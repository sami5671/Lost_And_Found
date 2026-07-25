const cloudinary = require("../configs/cloudinary");

/**
 * Uploads a file buffer directly to Cloudinary inside the specified folder.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} originalName - The original name of the uploaded file.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
const uploadToCloudinary = (fileBuffer, originalName, folder = "ID_Cards") => {
  return new Promise((resolve, reject) => {
    // Strip extension to create a clean public ID
    const baseName = originalName.split(".").slice(0, -1).join(".");
    const cleanPublicId = `${Date.now()}_${baseName.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: cleanPublicId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadToCloudinary,
};
