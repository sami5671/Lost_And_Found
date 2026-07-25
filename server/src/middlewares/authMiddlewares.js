const jwt = require("jsonwebtoken");
const User = require("../models/users");

const createJWT = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Only include safe info
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    // console.log(payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.send({ token: token });
  } catch (error) {
    console.error("JWT creation failed:", error);
    res.status(500).json({ error: "Token creation failed" });
  }
};

const verifyToken = (req, res, next) => {
  console.log("inside verify token", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "forbidden-access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "forbidden-access" });
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = {
  createJWT,
  verifyToken,
};
