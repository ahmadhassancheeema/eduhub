/**
 * favoriteController.js
 * ----------------------------------------------------
 * Handles student favorites.
 *
 * Current supported favorite types:
 * - module
 * - resource
 *
 * Later supported types:
 * - book
 * - question
 * - answer
 */

const db = require("../db");

const ALLOWED_TYPES = ["module", "resource", "book", "question", "answer"];

/**
 * GET /api/favorites
 * Gets all favorites for the logged-in student.
 */
async function getFavorites(req, res, next) {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT
        f.id,
        f.student_id,
        f.item_type,
        f.item_id,
        f.created_at,

        CASE
          WHEN f.item_type = 'module' THEN m.title
          WHEN f.item_type = 'resource' THEN r.title
          ELSE NULL
        END AS item_title,

        CASE
          WHEN f.item_type = 'module' THEN m.description
          WHEN f.item_type = 'resource' THEN r.description
          ELSE NULL
        END AS item_description,

        CASE
          WHEN f.item_type = 'module' THEN m.module_code
          ELSE NULL
        END AS module_code,

        CASE
          WHEN f.item_type = 'module' THEN c.name
          ELSE NULL
        END AS category_name,

        CASE
          WHEN f.item_type = 'resource' THEN r.resource_type
          ELSE NULL
        END AS resource_type,

        CASE
          WHEN f.item_type = 'resource' THEN r.external_url
          ELSE NULL
        END AS external_url,

        CASE
          WHEN f.item_type = 'resource' THEN r.file_url
          ELSE NULL
        END AS file_url,

        CASE
          WHEN f.item_type = 'resource' THEN r.module_id
          ELSE NULL
        END AS resource_module_id

      FROM favorites f

      LEFT JOIN modules m
        ON f.item_type = 'module'
        AND f.item_id = m.id

      LEFT JOIN module_categories c
        ON c.id = m.category_id

      LEFT JOIN resources r
        ON f.item_type = 'resource'
        AND f.item_id = r.id

      WHERE f.student_id = $1

      ORDER BY f.created_at DESC
      `,
      [studentId]
    );

    res.json({
      status: "success",
      count: result.rows.length,
      favorites: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/favorites
 * Adds an item to favorites.
 *
 * Body:
 * {
 *   "item_type": "module",
 *   "item_id": "uuid_here"
 * }
 */
async function addFavorite(req, res, next) {
  try {
    const studentId = req.user.id;
    const { item_type, item_id } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({
        status: "error",
        message: "item_type and item_id are required."
      });
    }

    if (!ALLOWED_TYPES.includes(item_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid favorite item type."
      });
    }

    if (item_type === "module") {
      const moduleCheck = await db.query(
        `SELECT id
         FROM modules
         WHERE id = $1
         AND is_published = TRUE`,
        [item_id]
      );

      if (moduleCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Module not found."
        });
      }
    }

    if (item_type === "resource") {
      const resourceCheck = await db.query(
        `SELECT id
         FROM resources
         WHERE id = $1`,
        [item_id]
      );

      if (resourceCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Resource not found."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO favorites (student_id, item_type, item_id)
      VALUES ($1, $2, $3)

      ON CONFLICT (student_id, item_type, item_id)
      DO NOTHING

      RETURNING id, student_id, item_type, item_id, created_at
      `,
      [studentId, item_type, item_id]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "success",
        message: "Item is already in favorites."
      });
    }

    res.status(201).json({
      status: "success",
      message: "Item added to favorites.",
      favorite: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/favorites/:id
 * Removes a favorite by favorite row ID.
 */
async function removeFavoriteById(req, res, next) {
  try {
    const studentId = req.user.id;
    const favoriteId = req.params.id;

    const result = await db.query(
      `
      DELETE FROM favorites
      WHERE id = $1
      AND student_id = $2
      RETURNING id
      `,
      [favoriteId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Favorite not found."
      });
    }

    res.json({
      status: "success",
      message: "Favorite removed."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/favorites
 * Removes a favorite by item_type and item_id.
 *
 * Body:
 * {
 *   "item_type": "module",
 *   "item_id": "uuid_here"
 * }
 */
async function removeFavoriteByItem(req, res, next) {
  try {
    const studentId = req.user.id;
    const { item_type, item_id } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({
        status: "error",
        message: "item_type and item_id are required."
      });
    }

    const result = await db.query(
      `
      DELETE FROM favorites
      WHERE student_id = $1
      AND item_type = $2
      AND item_id = $3
      RETURNING id
      `,
      [studentId, item_type, item_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Favorite not found."
      });
    }

    res.json({
      status: "success",
      message: "Favorite removed."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavoriteById,
  removeFavoriteByItem
};