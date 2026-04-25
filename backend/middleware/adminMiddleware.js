/**
 * adminMiddleware.js
 * ----------------------------------------------------
 * Allows access only to users with role = admin.
 * This middleware must run after authMiddleware.
 */

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required."
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required."
    });
  }

  next();
}

module.exports = adminOnly;