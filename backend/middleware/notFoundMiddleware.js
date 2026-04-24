/**
 * notFoundMiddleware.js
 * ----------------------------------------------------
 * Handles requests to routes that do not exist.
 */

function notFoundMiddleware(req, res, next) {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.originalUrl}`
  });
}

module.exports = notFoundMiddleware;