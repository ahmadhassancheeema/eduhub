/**
 * moduleController.js
 * ----------------------------------------------------
 * Handles Learning Wing module features:
 * - Get module categories
 * - Get modules
 * - Get one module
 * - Enroll in a module
 * - Unenroll from a module
 */

const db = require("../db");

/**
 * GET /api/modules/categories
 * Gets all module categories.
 */
async function getModuleCategories(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, name, description, created_at
       FROM module_categories
       ORDER BY name ASC`
    );

    res.json({
      status: "success",
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/modules
 * Gets all published modules with lesson count and user progress.
 */
async function getModules(req, res, next) {
  try {
    const studentId = req.user.id;
    const { search, category } = req.query;

    const values = [studentId];
    const conditions = ["m.is_published = TRUE"];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(m.title ILIKE $${values.length} OR m.module_code ILIKE $${values.length} OR m.description ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`c.name = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
      SELECT
        m.id,
        m.title,
        m.module_code,
        m.description,
        m.instructor_name,
        m.difficulty_level,
        m.estimated_hours,
        m.thumbnail_url,
        m.is_published,
        m.created_at,
        m.updated_at,
        c.name AS category_name,

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
        END AS progress_percentage,

        CASE
          WHEN me.id IS NULL THEN FALSE
          ELSE TRUE
        END AS is_enrolled

      FROM modules m
      LEFT JOIN module_categories c
        ON c.id = m.category_id
      LEFT JOIN lessons l
        ON l.module_id = m.id
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = $1
      LEFT JOIN module_enrollments me
        ON me.module_id = m.id
        AND me.student_id = $1

      ${whereClause}

      GROUP BY
        m.id,
        c.name,
        me.id

      ORDER BY m.created_at DESC
      `,
      values
    );

    res.json({
      status: "success",
      count: result.rows.length,
      modules: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/modules/:id
 * Gets one module with progress summary.
 */
async function getModuleById(req, res, next) {
  try {
    const studentId = req.user.id;
    const moduleId = req.params.id;

    const result = await db.query(
      `
      SELECT
        m.id,
        m.title,
        m.module_code,
        m.description,
        m.instructor_name,
        m.difficulty_level,
        m.estimated_hours,
        m.thumbnail_url,
        m.is_published,
        m.created_at,
        m.updated_at,
        c.name AS category_name,

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
        END AS progress_percentage,

        CASE
          WHEN me.id IS NULL THEN FALSE
          ELSE TRUE
        END AS is_enrolled

      FROM modules m
      LEFT JOIN module_categories c
        ON c.id = m.category_id
      LEFT JOIN lessons l
        ON l.module_id = m.id
      LEFT JOIN student_progress sp
        ON sp.lesson_id = l.id
        AND sp.student_id = $1
      LEFT JOIN module_enrollments me
        ON me.module_id = m.id
        AND me.student_id = $1

      WHERE m.id = $2
        AND m.is_published = TRUE

      GROUP BY
        m.id,
        c.name,
        me.id
      `,
      [studentId, moduleId]
    );

    const module = result.rows[0];

    if (!module) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    res.json({
      status: "success",
      module
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/modules/:id/enroll
 * Enrolls current student in a module.
 */
async function enrollInModule(req, res, next) {
  try {
    const studentId = req.user.id;
    const moduleId = req.params.id;

    const moduleCheck = await db.query(
      `SELECT id, title
       FROM modules
       WHERE id = $1
       AND is_published = TRUE`,
      [moduleId]
    );

    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    await db.query(
      `INSERT INTO module_enrollments (student_id, module_id)
       VALUES ($1, $2)
       ON CONFLICT (student_id, module_id) DO NOTHING`,
      [studentId, moduleId]
    );

    res.json({
      status: "success",
      message: "Module started successfully.",
      module: moduleCheck.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/modules/:id/unenroll
 * Removes current student's enrollment from a module.
 * This also deletes progress because of the manual delete below.
 */
async function unenrollFromModule(req, res, next) {
  try {
    const studentId = req.user.id;
    const moduleId = req.params.id;

    await db.query(
      `DELETE FROM student_progress
       WHERE student_id = $1
       AND module_id = $2`,
      [studentId, moduleId]
    );

    const result = await db.query(
      `DELETE FROM module_enrollments
       WHERE student_id = $1
       AND module_id = $2
       RETURNING id`,
      [studentId, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "You are not enrolled in this module."
      });
    }

    res.json({
      status: "success",
      message: "Module removed from your learning list."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getModuleCategories,
  getModules,
  getModuleById,
  enrollInModule,
  unenrollFromModule
};