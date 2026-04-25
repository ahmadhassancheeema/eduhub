/**
 * adminLearningRoutes.js
 * ----------------------------------------------------
 * Admin-only routes for learning content management.
 */

const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getCategories,
  createCategory,
  getAdminModules,
  createModule,
  updateModule,
  updateModuleStatus,
  getAdminLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getAdminResources,
  createResource,
  updateResource,
  deleteResource
} = require("../controllers/adminLearningController");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/categories", getCategories);
router.post("/categories", createCategory);

router.get("/modules", getAdminModules);
router.post("/modules", createModule);
router.put("/modules/:id", updateModule);
router.put("/modules/:id/status", updateModuleStatus);

router.get("/modules/:moduleId/lessons", getAdminLessons);
router.get("/modules/:moduleId/resources", getAdminResources);

router.post("/lessons", createLesson);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);

router.post("/resources", createResource);
router.put("/resources/:id", updateResource);
router.delete("/resources/:id", deleteResource);

module.exports = router;