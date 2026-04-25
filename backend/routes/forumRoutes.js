/**
 * forumRoutes.js
 * ----------------------------------------------------
 * Routes for EduHub Discussion Forum.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getForumCategories,
  getForumTags,
  getQuestions,
  getQuestionById,
  createQuestion,
  createAnswer,
  vote,
  reportContent,
  getMyForumCount
} = require("../controllers/forumController");

const router = express.Router();

router.get("/categories", protect, getForumCategories);

router.get("/tags", protect, getForumTags);

router.get("/my-count", protect, getMyForumCount);

router.get("/questions", protect, getQuestions);

router.post("/questions", protect, createQuestion);

router.get("/questions/:id", protect, getQuestionById);

router.post("/questions/:id/answers", protect, createAnswer);

router.post("/vote", protect, vote);

router.post("/report", protect, reportContent);

module.exports = router;