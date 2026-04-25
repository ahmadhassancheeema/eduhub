/**
 * adminRoutes.js
 * ----------------------------------------------------
 * Admin-only routes for EduHub.
 */

const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAdminOrders,
  updateOrderStatus,
  getForumReports,
  updateForumReport,
  updateQuestionStatus,
  updateAnswerStatus
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/dashboard", getAdminDashboard);

router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", updateUserStatus);

router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateOrderStatus);

router.get("/reports", getForumReports);
router.put("/reports/:id", updateForumReport);

router.put("/forum/questions/:id/status", updateQuestionStatus);
router.put("/forum/answers/:id/status", updateAnswerStatus);

module.exports = router;