/**
 * adminLearningController.js
 * ----------------------------------------------------
 * Admin-only learning content management:
 * - Module categories
 * - Modules
 * - Lessons
 * - Resources
 */

const db = require("../db");

const ALLOWED_DIFFICULTY = ["beginner", "intermediate", "advanced"];
const ALLOWED_RESOURCE_TYPES = ["pdf", "video", "slide", "link", "text"];

/**
 * GET /api/admin/learning/categories
 */
async function getCategories(req, res, next) {
  try {
    const result = await db.query(
      `
      SELECT id, name, description, created_at
      FROM module_categories
      ORDER BY name ASC
      `
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
 * POST /api/admin/learning/categories
 */
async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Category name is required."
      });
    }

    const result = await db.query(
      `
      INSERT INTO module_categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at
      `,
      [name.trim(), description ? description.trim() : null]
    );

    res.status(201).json({
      status: "success",
      message: "Category created successfully.",
      category: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists."
      });
    }

    next(error);
  }
}

/**
 * GET /api/admin/learning/modules
 */
async function getAdminModules(req, res, next) {
  try {
    const { search, status } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          m.title ILIKE $${values.length}
          OR m.module_code ILIKE $${values.length}
          OR m.description ILIKE $${values.length}
          OR m.instructor_name ILIKE $${values.length}
        )
      `);
    }

    if (status === "published") {
      conditions.push("m.is_published = TRUE");
    }

    if (status === "unpublished") {
      conditions.push("m.is_published = FALSE");
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
        m.category_id,
        m.instructor_name,
        m.difficulty_level,
        m.estimated_hours,
        m.thumbnail_url,
        m.is_published,
        m.created_at,
        m.updated_at,
        c.name AS category_name,
        COUNT(DISTINCT l.id)::INTEGER AS lesson_count,
        COUNT(DISTINCT r.id)::INTEGER AS resource_count
      FROM modules m
      LEFT JOIN module_categories c
        ON c.id = m.category_id
      LEFT JOIN lessons l
        ON l.module_id = m.id
      LEFT JOIN resources r
        ON r.module_id = m.id
      ${whereClause}
      GROUP BY m.id, c.name
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
 * POST /api/admin/learning/modules
 */
async function createModule(req, res, next) {
  try {
    const {
      title,
      module_code,
      description,
      category_id,
      instructor_name,
      difficulty_level,
      estimated_hours,
      thumbnail_url,
      is_published
    } = req.body;

    if (!title || !module_code || !description || !instructor_name) {
      return res.status(400).json({
        status: "error",
        message: "Title, module code, description, and instructor name are required."
      });
    }

    const difficulty = difficulty_level || "beginner";

    if (!ALLOWED_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid difficulty level."
      });
    }

    const hours = Number(estimated_hours || 0);

    if (!Number.isInteger(hours) || hours < 0) {
      return res.status(400).json({
        status: "error",
        message: "Estimated hours must be a whole number."
      });
    }

    if (category_id) {
      const categoryCheck = await db.query(
        `SELECT id FROM module_categories WHERE id = $1`,
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Category not found."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO modules (
        title,
        module_code,
        description,
        category_id,
        instructor_name,
        difficulty_level,
        estimated_hours,
        thumbnail_url,
        is_published
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        title.trim(),
        module_code.trim().toUpperCase(),
        description.trim(),
        category_id || null,
        instructor_name.trim(),
        difficulty,
        hours,
        thumbnail_url ? thumbnail_url.trim() : null,
        is_published === false ? false : true
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Module created successfully.",
      module: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A module with this code already exists."
      });
    }

    next(error);
  }
}

/**
 * PUT /api/admin/learning/modules/:id
 */
async function updateModule(req, res, next) {
  try {
    const moduleId = req.params.id;

    const {
      title,
      module_code,
      description,
      category_id,
      instructor_name,
      difficulty_level,
      estimated_hours,
      thumbnail_url,
      is_published
    } = req.body;

    if (!title || !module_code || !description || !instructor_name) {
      return res.status(400).json({
        status: "error",
        message: "Title, module code, description, and instructor name are required."
      });
    }

    const difficulty = difficulty_level || "beginner";

    if (!ALLOWED_DIFFICULTY.includes(difficulty)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid difficulty level."
      });
    }

    const hours = Number(estimated_hours || 0);

    if (!Number.isInteger(hours) || hours < 0) {
      return res.status(400).json({
        status: "error",
        message: "Estimated hours must be a whole number."
      });
    }

    if (category_id) {
      const categoryCheck = await db.query(
        `SELECT id FROM module_categories WHERE id = $1`,
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Category not found."
        });
      }
    }

    const result = await db.query(
      `
      UPDATE modules
      SET
        title = $1,
        module_code = $2,
        description = $3,
        category_id = $4,
        instructor_name = $5,
        difficulty_level = $6,
        estimated_hours = $7,
        thumbnail_url = $8,
        is_published = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
      `,
      [
        title.trim(),
        module_code.trim().toUpperCase(),
        description.trim(),
        category_id || null,
        instructor_name.trim(),
        difficulty,
        hours,
        thumbnail_url ? thumbnail_url.trim() : null,
        is_published === false ? false : true,
        moduleId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    res.json({
      status: "success",
      message: "Module updated successfully.",
      module: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A module with this code already exists."
      });
    }

    next(error);
  }
}

/**
 * PUT /api/admin/learning/modules/:id/status
 */
async function updateModuleStatus(req, res, next) {
  try {
    const moduleId = req.params.id;
    const { is_published } = req.body;

    if (typeof is_published !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_published must be true or false."
      });
    }

    const result = await db.query(
      `
      UPDATE modules
      SET is_published = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, module_code, is_published, updated_at
      `,
      [is_published, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    res.json({
      status: "success",
      message: "Module status updated.",
      module: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/learning/modules/:moduleId/lessons
 */
async function getAdminLessons(req, res, next) {
  try {
    const moduleId = req.params.moduleId;

    const result = await db.query(
      `
      SELECT
        id,
        module_id,
        title,
        description,
        lesson_order,
        duration_minutes,
        created_at,
        updated_at
      FROM lessons
      WHERE module_id = $1
      ORDER BY lesson_order ASC
      `,
      [moduleId]
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
 * POST /api/admin/learning/lessons
 */
async function createLesson(req, res, next) {
  try {
    const {
      module_id,
      title,
      description,
      lesson_order,
      duration_minutes
    } = req.body;

    if (!module_id || !title || !lesson_order) {
      return res.status(400).json({
        status: "error",
        message: "module_id, title, and lesson_order are required."
      });
    }

    const order = Number(lesson_order);
    const duration = Number(duration_minutes || 0);

    if (!Number.isInteger(order) || order < 1) {
      return res.status(400).json({
        status: "error",
        message: "Lesson order must be a positive whole number."
      });
    }

    if (!Number.isInteger(duration) || duration < 0) {
      return res.status(400).json({
        status: "error",
        message: "Duration must be a whole number."
      });
    }

    const moduleCheck = await db.query(
      `SELECT id FROM modules WHERE id = $1`,
      [module_id]
    );

    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    const result = await db.query(
      `
      INSERT INTO lessons (
        module_id,
        title,
        description,
        lesson_order,
        duration_minutes
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        module_id,
        title.trim(),
        description ? description.trim() : null,
        order,
        duration
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Lesson created successfully.",
      lesson: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "This lesson order already exists for this module."
      });
    }

    next(error);
  }
}

/**
 * PUT /api/admin/learning/lessons/:id
 */
async function updateLesson(req, res, next) {
  try {
    const lessonId = req.params.id;

    const {
      title,
      description,
      lesson_order,
      duration_minutes
    } = req.body;

    if (!title || !lesson_order) {
      return res.status(400).json({
        status: "error",
        message: "Title and lesson_order are required."
      });
    }

    const order = Number(lesson_order);
    const duration = Number(duration_minutes || 0);

    if (!Number.isInteger(order) || order < 1) {
      return res.status(400).json({
        status: "error",
        message: "Lesson order must be a positive whole number."
      });
    }

    if (!Number.isInteger(duration) || duration < 0) {
      return res.status(400).json({
        status: "error",
        message: "Duration must be a whole number."
      });
    }

    const result = await db.query(
      `
      UPDATE lessons
      SET
        title = $1,
        description = $2,
        lesson_order = $3,
        duration_minutes = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [
        title.trim(),
        description ? description.trim() : null,
        order,
        duration,
        lessonId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Lesson not found."
      });
    }

    res.json({
      status: "success",
      message: "Lesson updated successfully.",
      lesson: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "This lesson order already exists for this module."
      });
    }

    next(error);
  }
}

/**
 * DELETE /api/admin/learning/lessons/:id
 */
async function deleteLesson(req, res, next) {
  try {
    const lessonId = req.params.id;

    const result = await db.query(
      `
      DELETE FROM lessons
      WHERE id = $1
      RETURNING id
      `,
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Lesson not found."
      });
    }

    res.json({
      status: "success",
      message: "Lesson deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/learning/modules/:moduleId/resources
 */
async function getAdminResources(req, res, next) {
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
 * POST /api/admin/learning/resources
 */
async function createResource(req, res, next) {
  try {
    const {
      module_id,
      lesson_id,
      title,
      description,
      resource_type,
      file_url,
      external_url
    } = req.body;

    if (!module_id || !title || !resource_type) {
      return res.status(400).json({
        status: "error",
        message: "module_id, title, and resource_type are required."
      });
    }

    if (!ALLOWED_RESOURCE_TYPES.includes(resource_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid resource type."
      });
    }

    if (resource_type !== "text" && !file_url && !external_url) {
      return res.status(400).json({
        status: "error",
        message: "Non-text resources must have a file URL or external URL."
      });
    }

    const moduleCheck = await db.query(
      `SELECT id FROM modules WHERE id = $1`,
      [module_id]
    );

    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Module not found."
      });
    }

    if (lesson_id) {
      const lessonCheck = await db.query(
        `
        SELECT id
        FROM lessons
        WHERE id = $1
          AND module_id = $2
        `,
        [lesson_id, module_id]
      );

      if (lessonCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Lesson not found in this module."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO resources (
        module_id,
        lesson_id,
        title,
        description,
        resource_type,
        file_url,
        external_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        module_id,
        lesson_id || null,
        title.trim(),
        description ? description.trim() : null,
        resource_type,
        file_url ? file_url.trim() : null,
        external_url ? external_url.trim() : null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Resource created successfully.",
      resource: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/learning/resources/:id
 */
async function updateResource(req, res, next) {
  try {
    const resourceId = req.params.id;

    const {
      module_id,
      lesson_id,
      title,
      description,
      resource_type,
      file_url,
      external_url
    } = req.body;

    if (!module_id || !title || !resource_type) {
      return res.status(400).json({
        status: "error",
        message: "module_id, title, and resource_type are required."
      });
    }

    if (!ALLOWED_RESOURCE_TYPES.includes(resource_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid resource type."
      });
    }

    if (resource_type !== "text" && !file_url && !external_url) {
      return res.status(400).json({
        status: "error",
        message: "Non-text resources must have a file URL or external URL."
      });
    }

    if (lesson_id) {
      const lessonCheck = await db.query(
        `
        SELECT id
        FROM lessons
        WHERE id = $1
          AND module_id = $2
        `,
        [lesson_id, module_id]
      );

      if (lessonCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Lesson not found in this module."
        });
      }
    }

    const result = await db.query(
      `
      UPDATE resources
      SET
        module_id = $1,
        lesson_id = $2,
        title = $3,
        description = $4,
        resource_type = $5,
        file_url = $6,
        external_url = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
      `,
      [
        module_id,
        lesson_id || null,
        title.trim(),
        description ? description.trim() : null,
        resource_type,
        file_url ? file_url.trim() : null,
        external_url ? external_url.trim() : null,
        resourceId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Resource not found."
      });
    }

    res.json({
      status: "success",
      message: "Resource updated successfully.",
      resource: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/learning/resources/:id
 */
async function deleteResource(req, res, next) {
  try {
    const resourceId = req.params.id;

    const result = await db.query(
      `
      DELETE FROM resources
      WHERE id = $1
      RETURNING id
      `,
      [resourceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Resource not found."
      });
    }

    res.json({
      status: "success",
      message: "Resource deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};