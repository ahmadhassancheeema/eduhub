/**
 * resourceController.js
 * ----------------------------------------------------
 * Handles learning resources such as notes, videos, slides, and links.
 */

const db = require("../db");

/**
 * GET /api/modules/:moduleId/resources
 * Gets all resources for a module.
 */
async function getResourcesByModule(req, res, next) {
  try {
    const moduleId = req.params.moduleId;

    const result = await db.query(
      `
      SELECT
        r.id,
        r.module_id,
        r.lesson_id,
        r.title,
        r.description,
        r.resource_type,
        r.file_url,
        r.external_url,
        r.created_at,
        r.updated_at,
        l.title AS lesson_title,
        l.lesson_order

      FROM resources r
      LEFT JOIN lessons l
        ON l.id = r.lesson_id

      WHERE r.module_id = $1

      ORDER BY l.lesson_order ASC, r.created_at ASC
      `,
      [moduleId]
    );

    res.json({
      status: "success",
      count: result.rows.length,
      resources: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lessons/:lessonId/resources
 * Gets all resources for a lesson.
 */
async function getResourcesByLesson(req, res, next) {
  try {
    const lessonId = req.params.lessonId;

    const result = await db.query(
      `
      SELECT
        id,
        module_id,
        lesson_id,
        title,
        description,
        resource_type,
        file_url,
        external_url,
        created_at,
        updated_at

      FROM resources

      WHERE lesson_id = $1

      ORDER BY created_at ASC
      `,
      [lessonId]
    );

    res.json({
      status: "success",
      count: result.rows.length,
      resources: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/resources/:id
 * Gets one resource.
 */
async function getResourceById(req, res, next) {
  try {
    const resourceId = req.params.id;

    const result = await db.query(
      `
      SELECT
        r.id,
        r.module_id,
        r.lesson_id,
        r.title,
        r.description,
        r.resource_type,
        r.file_url,
        r.external_url,
        r.created_at,
        r.updated_at,
        l.title AS lesson_title,
        m.title AS module_title

      FROM resources r
      LEFT JOIN lessons l
        ON l.id = r.lesson_id
      LEFT JOIN modules m
        ON m.id = r.module_id

      WHERE r.id = $1
      `,
      [resourceId]
    );

    const resource = result.rows[0];

    if (!resource) {
      return res.status(404).json({
        status: "error",
        message: "Resource not found."
      });
    }

    res.json({
      status: "success",
      resource
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getResourcesByModule,
  getResourcesByLesson,
  getResourceById
};