/**
 * moduleRoutes.js
 * ----------------------------------------------------
 * Routes for Learning Wing modules, lessons, and resources.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const moduleController = require("../controllers/moduleController");
const lessonController = require("../controllers/lessonController");
const resourceController = require("../controllers/resourceController");

const router = express.Router();

router.get("/categories", protect, moduleController.getModuleCategories);

router.get("/", protect, moduleController.getModules);

router.get("/:id", protect, moduleController.getModuleById);

router.post("/:id/enroll", protect, moduleController.enrollInModule);

router.delete("/:id/unenroll", protect, moduleController.unenrollFromModule);

router.get("/:moduleId/lessons", protect, lessonController.getLessonsByModule);

router.get("/:moduleId/resources", protect, resourceController.getResourcesByModule);

module.exports = router;