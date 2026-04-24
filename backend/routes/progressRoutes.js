/**
 * progressRoutes.js
 * ----------------------------------------------------
 * Routes for student learning progress.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getOverallProgress,
  getModuleProgress,
  completeLesson,
  uncompleteLesson
} = require("../controllers/progressController");

const router = express.Router();

router.get("/", protect, getOverallProgress);

router.post("/complete-lesson", protect, completeLesson);

router.post("/uncomplete-lesson", protect, uncompleteLesson);

router.get("/:moduleId", protect, getModuleProgress);

module.exports = router;