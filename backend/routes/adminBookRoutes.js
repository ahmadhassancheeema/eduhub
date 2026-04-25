/**
 * adminBookRoutes.js
 * ----------------------------------------------------
 * Admin-only routes for bookstore management.
 */

const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAdminBooks,
  createBook,
  updateBook,
  updateBookStatus
} = require("../controllers/adminBookController");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminBooks);

router.post("/", createBook);

router.put("/:id", updateBook);

router.put("/:id/status", updateBookStatus);

module.exports = router;