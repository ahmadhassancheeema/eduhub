/**
 * lessonRoutes.js
 * ----------------------------------------------------
 * Routes for individual lesson access.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const { getLessonById } = require("../controllers/lessonController");

const { getResourcesByLesson } = require("../controllers/resourceController");

const router = express.Router();

router.get("/:lessonId/resources", protect, getResourcesByLesson);

router.get("/:id", protect, getLessonById);

module.exports = router;