/**
 * bookRoutes.js
 * ----------------------------------------------------
 * Routes for bookstore book browsing.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getBooks,
  getBookCategories,
  getBookById
} = require("../controllers/bookController");

const router = express.Router();

router.get("/categories", protect, getBookCategories);

router.get("/", protect, getBooks);

router.get("/:id", protect, getBookById);

module.exports = router;