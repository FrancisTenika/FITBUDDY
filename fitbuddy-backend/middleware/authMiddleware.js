const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fitbuddy_default_secret");

      // Attach decoded user
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        req.user = { id: decoded.id, _id: decoded.id };
      }
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token is not valid or has expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
  }
};

module.exports = protect;
module.exports.protect = protect;