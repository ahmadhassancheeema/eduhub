/**
 * errorMiddleware.js
 * ----------------------------------------------------
 * Global error handler for the EduHub backend.
 */

function errorMiddleware(error, req, res, next) {
  console.error("Server error:", error);

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Internal server error."
  });
}

module.exports = errorMiddleware;