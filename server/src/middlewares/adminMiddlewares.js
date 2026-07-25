const { apiResponse } = require("../helpers");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const verifyAdmin = async (req, res, next) => {
  try {
    // Use decoded from verifyToken if available, otherwise verify here
    const decoded = req.decoded || jwt.verify(req.headers["authorization"]?.split(" ")[1], process.env.JWT_SECRET);
    
    const userId = decoded._id || decoded.id;
    if (!userId) {
      return apiResponse(res, 401, false, "Invalid token payload");
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    if (user.role !== "admin") {
      return apiResponse(res, 403, false, "Forbidden: Admins only");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin verification failed:", error.message);
    return apiResponse(res, 401, false, "Invalid or expired token");
  }
};

module.exports = { verifyAdmin };
