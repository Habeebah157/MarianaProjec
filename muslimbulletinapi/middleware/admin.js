// adminMiddleware.js
function requireAdmin(req, res, next) {
  // Assuming you decoded the JWT and attached user info to req.user
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

module.exports = requireAdmin;
