const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const token = req.header("token");

  if (!token) {
    return res.status(403).json({ msg: "Authorization denied, token missing" });
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verify.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
}

// Check admin role middleware
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

// Middleware to check for allowed roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.member_type)) {
      return res.status(403).json({ message: `Access denied: ${req.user.member_type}` });
    }
    next();
  };
}

module.exports = { verifyToken, requireAdmin, requireRole };
