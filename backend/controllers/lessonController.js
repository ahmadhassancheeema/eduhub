/**
 * lessonController.js
 * ----------------------------------------------------
 * Handles lessons inside modules.
 */

const db = require("../db");

/**
 * GET /api/modules/:moduleId/lessons
 * Gets all lessons for a module with current student's completion status.
 */
async function getLessonsByModule(req, res, next) {
  try {
    const studentId = req.user.id;
    const moduleId = req.params.moduleId;

    const result = await db.query(
      `
      SELECT
        l.id,
        l.module_id,
        l.title,
        l.description,
        l.lesson_order,
        l.duration_minutes,
        l.created_at,
        l.updated_at,

        COALESCE(sp.is_completed, FALSE) AS is_completed,
        sp.completed_at,
        sp.last_accessed_at

      FROM lessons l
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = $1

      WHERE l.module_id = $2

      ORDER BY l.lesson_order ASC
      `,
      [studentId, moduleId]
    );

    res.json({
      status: "success",
      count: result.rows.length,
      lessons: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lessons/:id
 * Gets one lesson.
 */
async function getLessonById(req, res, next) {
  try {
    const studentId = req.user.id;
    const lessonId = req.params.id;

    const result = await db.query(
      `
      SELECT
        l.id,
        l.module_id,
        l.title,
        l.description,
        l.lesson_order,
        l.duration_minutes,
        l.created_at,
        l.updated_at,

        COALESCE(sp.is_completed, FALSE) AS is_completed,
        sp.completed_at,
        sp.last_accessed_at

      FROM lessons l
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = $1

      WHERE l.id = $2
      `,
      [studentId, lessonId]
    );

    const lesson = result.rows[0];

    if (!lesson) {
      return res.status(404).json({
        status: "error",
        message: "Lesson not found."
      });
    }

    res.json({
      status: "success",
      lesson
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLessonsByModule,
  getLessonById
};