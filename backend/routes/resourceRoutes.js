/**
 * resourceRoutes.js
 * ----------------------------------------------------
 * Routes for individual learning resources.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const { getResourceById } = require("../controllers/resourceController");

const router = express.Router();

router.get("/:id", protect, getResourceById);

module.exports = router;