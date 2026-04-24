/**
 * progressController.js
 * ----------------------------------------------------
 * Handles module enrollment and lesson progress tracking.
 */

const db = require("../db");

/**
 * GET /api/progress
 * Gets current student's overall progress summary.
 */
async function getOverallProgress(req, res, next) {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT
        COUNT(DISTINCT me.module_id)::INTEGER AS modules_started,

        COUNT(DISTINCT CASE
          WHEN sp.is_completed = TRUE THEN sp.lesson_id
        END)::INTEGER AS completed_lessons,

        COUNT(DISTINCT l.id)::INTEGER AS total_lessons_in_started_modules,

        CASE
          WHEN COUNT(DISTINCT l.id) = 0 THEN 0
          ELSE ROUND(
            (
              COUNT(DISTINCT CASE WHEN sp.is_completed = TRUE THEN sp.lesson_id END)::NUMERIC
              / COUNT(DISTINCT l.id)::NUMERIC
            ) * 100
          )::INTEGER
        END AS overall_progress_percentage

      FROM module_enrollments me
      LEFT JOIN lessons l
        ON l.module_id = me.module_id
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = me.student_id

      WHERE me.student_id = $1
      `,
      [studentId]
    );

    res.json({
      status: "success",
      progress: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/progress/:moduleId
 * Gets progress for one module.
 */
async function getModuleProgress(req, res, next) {
  try {
    const studentId = req.user.id;
    const moduleId = req.params.moduleId;

    const result = await db.query(
      `
      SELECT
        m.id AS module_id,
        m.title AS module_title,
        m.module_code,

        COUNT(DISTINCT l.id)::INTEGER AS total_lessons,

        COUNT(DISTINCT CASE
          WHEN sp.is_completed = TRUE THEN sp.lesson_id
        END)::INTEGER AS completed_lessons,

        CASE
          WHEN COUNT(DISTINCT l.id) = 0 THEN 0
          ELSE ROUND(
            (
              COUNT(DISTINCT CASE WHEN sp.is_completed = TRUE THEN sp.lesson_id END)::NUMERIC
              / COUNT(DISTINCT l.id)::NUMERIC
            ) * 100
          )::INTEGER
        END AS progress_percentage

      FROM modules m
      LEFT JOIN lessons l
        ON l.module_id = m.id
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = $1

      WHERE m.id = $2

      GROUP BY m.id
      `,
      [studentId, moduleId]
    );

    const progress = result.rows[0];

    if (!progress) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    res.json({
      status: "success",
      progress
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/progress/complete-lesson
 * Marks a lesson as completed.
 *
 * Body:
 * {
 *   "module_id": "...",
 *   "lesson_id": "..."
 * }
 */
async function completeLesson(req, res, next) {
  try {
    const studentId = req.user.id;
    const { module_id, lesson_id } = req.body;

    if (!module_id || !lesson_id) {
      return res.status(400).json({
        status: "error",
        message: "module_id and lesson_id are required."
      });
    }

    const lessonCheck = await db.query(
      `SELECT id
       FROM lessons
       WHERE id = $1
       AND module_id = $2`,
      [lesson_id, module_id]
    );

    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Lesson not found in this module."
      });
    }

    await db.query(
      `INSERT INTO module_enrollments (student_id, module_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, module_id) DO NOTHING`,
      [studentId, module_id]
    );

    await db.query(
      `
      INSERT INTO student_progress
        (student_id, module_id, lesson_id, is_completed, completed_at, last_accessed_at)
      VALUES
        ($1, $2, $3, TRUE, NOW(), NOW())

      ON CONFLICT (student_id, lesson_id)
      DO UPDATE SET
        is_completed = TRUE,
        completed_at = NOW(),
        last_accessed_at = NOW()
      `,
      [studentId, module_id, lesson_id]
    );

    res.json({
      status: "success",
      message: "Lesson marked as completed."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/progress/uncomplete-lesson
 * Marks a lesson as not completed.
 *
 * Body:
 * {
 *   "module_id": "...",
 *   "lesson_id": "..."
 * }
 */
async function uncompleteLesson(req, res, next) {
  try {
    const studentId = req.user.id;
    const { module_id, lesson_id } = req.body;

    if (!module_id || !lesson_id) {
      return res.status(400).json({
        status: "error",
        message: "module_id and lesson_id are required."
      });
    }

    const result = await db.query(
      `
      UPDATE student_progress
      SET
        is_completed = FALSE,
        completed_at = NULL,
        last_accessed_at = NOW()
      WHERE student_id = $1
      AND module_id = $2
      AND lesson_id = $3
      RETURNING id
      `,
      [studentId, module_id, lesson_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Progress record not found."
      });
    }

    res.json({
      status: "success",
      message: "Lesson marked as incomplete."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverallProgress,
  getModuleProgress,
  completeLesson,
  uncompleteLesson
};