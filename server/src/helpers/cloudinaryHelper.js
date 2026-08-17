const cloudinary = require("../configs/cloudinary");

/**
 * Uploads a file buffer directly to Cloudinary inside the specified folder.
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {string} originalName - The original name of the uploaded file.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
const uploadToCloudinary = (fileBuffer, originalName, folder = "ID_Cards", removeBg = false) => {
  return new Promise((resolve, reject) => {
    // Strip extension to create a clean public ID
    const baseName = originalName.split(".").slice(0, -1).join(".");
    const cleanPublicId = `${Date.now()}_${baseName.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const options = {
      folder: folder,
      public_id: cleanPublicId,
      resource_type: "auto",
    };

    if (removeBg || folder === "Items") {
      // Cloudinary AI background removal add-on parameter
      options.background_removal = "cloudinary_ai";
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          // Fall back gracefully if account does not have background_removal add-on enabled
          if (options.background_removal) {
            console.warn("Cloudinary AI background removal add-on unavailable, falling back to standard upload:", error.message || error);
            delete options.background_removal;
            const fallbackStream = cloudinary.uploader.upload_stream(options, (err2, res2) => {
              if (err2) {
                console.error("Cloudinary upload error:", err2);
                return reject(err2);
              }
              resolve(res2.secure_url);
            });
            return fallbackStream.end(fileBuffer);
          }
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its secure URL.
 * @param {string} url - The Cloudinary image URL.
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = (url) => {
  return new Promise((resolve) => {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
      return resolve(null);
    }
    try {
      const parts = url.split("/upload/");
      if (parts.length < 2) return resolve(null);
      let publicIdWithExt = parts[1];
      // Remove version string (e.g. v1722259999/) if present
      publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, "");
      // Remove file extension
      const lastDotIndex = publicIdWithExt.lastIndexOf(".");
      const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

      if (!publicId) return resolve(null);

      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary delete error:", error);
        } else {
          console.log("Cloudinary deleted old image successfully:", publicId, result);
        }
        resolve(result);
      });
    } catch (err) {
      console.error("Failed to parse Cloudinary URL for deletion:", err);
      resolve(null);
    }
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
