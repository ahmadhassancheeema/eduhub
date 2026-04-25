/**
 * adminController.js
 * ----------------------------------------------------
 * Handles Admin Panel backend features:
 * - Dashboard analytics
 * - User management
 * - Order management
 * - Forum report management
 * - Basic forum moderation
 */

const db = require("../db");

const ALLOWED_ROLES = ["student", "moderator", "admin"];
const ALLOWED_USER_STATUS = [true, false];
const ALLOWED_REPORT_STATUS = ["pending", "reviewed", "rejected"];
const ALLOWED_QUESTION_STATUS = ["open", "closed", "hidden", "locked"];
const ALLOWED_ANSWER_STATUS = ["visible", "hidden"];
const ALLOWED_ORDER_STATUS = ["pending", "completed", "cancelled"];

/**
 * GET /api/admin/dashboard
 * Returns platform analytics for admin dashboard.
 */
async function getAdminDashboard(req, res, next) {
  try {
    const [
      usersResult,
      modulesResult,
      lessonsResult,
      resourcesResult,
      booksResult,
      ordersResult,
      forumResult,
      reportsResult
    ] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_users,
          COUNT(*) FILTER (WHERE role = 'student')::INTEGER AS total_students,
          COUNT(*) FILTER (WHERE role = 'moderator')::INTEGER AS total_moderators,
          COUNT(*) FILTER (WHERE role = 'admin')::INTEGER AS total_admins,
          COUNT(*) FILTER (WHERE is_active = FALSE)::INTEGER AS inactive_users
        FROM users
      `),

      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_modules,
          COUNT(*) FILTER (WHERE is_published = TRUE)::INTEGER AS published_modules,
          COUNT(*) FILTER (WHERE is_published = FALSE)::INTEGER AS unpublished_modules
        FROM modules
      `),

      db.query(`
        SELECT COUNT(*)::INTEGER AS total_lessons
        FROM lessons
      `),

      db.query(`
        SELECT COUNT(*)::INTEGER AS total_resources
        FROM resources
      `),

      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_books,
          COUNT(*) FILTER (WHERE is_active = TRUE)::INTEGER AS active_books,
          COUNT(*) FILTER (WHERE stock_quantity = 0)::INTEGER AS out_of_stock_books
        FROM books
      `),

      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_orders,
          COALESCE(SUM(total_amount), 0)::NUMERIC(10,2) AS total_sales,
          COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER AS cancelled_orders
        FROM orders
      `),

      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_questions,
          COUNT(*) FILTER (WHERE status = 'open')::INTEGER AS open_questions,
          COUNT(*) FILTER (WHERE status = 'hidden')::INTEGER AS hidden_questions,
          (
            SELECT COUNT(*)::INTEGER
            FROM forum_answers
          ) AS total_answers
        FROM forum_questions
      `),

      db.query(`
        SELECT
          COUNT(*)::INTEGER AS total_reports,
          COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_reports,
          COUNT(*) FILTER (WHERE status = 'reviewed')::INTEGER AS reviewed_reports,
          COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected_reports
        FROM forum_reports
      `)
    ]);

    res.json({
      status: "success",
      analytics: {
        users: usersResult.rows[0],
        modules: modulesResult.rows[0],
        lessons: lessonsResult.rows[0],
        resources: resourcesResult.rows[0],
        books: booksResult.rows[0],
        orders: ordersResult.rows[0],
        forum: forumResult.rows[0],
        reports: reportsResult.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 * Returns users.
 * Optional query:
 * - search
 */
async function getUsers(req, res, next) {
  try {
    const { search } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          full_name ILIKE $${values.length}
          OR email ILIKE $${values.length}
          OR student_id ILIKE $${values.length}
          OR program ILIKE $${values.length}
        )
      `);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        student_id,
        program,
        year_of_study,
        role,
        avatar_url,
        is_active,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      `,
      values
    );

    res.json({
      status: "success",
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Body:
 * {
 *   "role": "student"
 * }
 */
async function updateUserRole(req, res, next) {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role."
      });
    }

    const result = await db.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING
        id,
        full_name,
        email,
        student_id,
        program,
        year_of_study,
        role,
        is_active,
        created_at,
        updated_at
      `,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    res.json({
      status: "success",
      message: "User role updated.",
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/users/:id/status
 * Body:
 * {
 *   "is_active": false
 * }
 */
async function updateUserStatus(req, res, next) {
  try {
    const userId = req.params.id;
    const { is_active } = req.body;

    if (!ALLOWED_USER_STATUS.includes(is_active)) {
      return res.status(400).json({
        status: "error",
        message: "is_active must be true or false."
      });
    }

    if (userId === req.user.id && is_active === false) {
      return res.status(400).json({
        status: "error",
        message: "You cannot deactivate your own admin account."
      });
    }

    const result = await db.query(
      `
      UPDATE users
      SET is_active = $1
      WHERE id = $2
      RETURNING
        id,
        full_name,
        email,
        student_id,
        program,
        year_of_study,
        role,
        is_active,
        created_at,
        updated_at
      `,
      [is_active, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    res.json({
      status: "success",
      message: "User status updated.",
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 * Returns all orders.
 */
async function getAdminOrders(req, res, next) {
  try {
    const result = await db.query(
      `
      SELECT
        o.id,
        o.student_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,

        u.full_name AS student_name,
        u.email AS student_email,

        COUNT(oi.id)::INTEGER AS item_count

      FROM orders o
      JOIN users u
        ON u.id = o.student_id
      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      GROUP BY o.id, u.full_name, u.email

      ORDER BY o.created_at DESC
      `
    );

    res.json({
      status: "success",
      count: result.rows.length,
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/status
 * Body:
 * {
 *   "status": "completed"
 * }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!ALLOWED_ORDER_STATUS.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order status."
      });
    }

    const result = await db.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, student_id, total_amount, status, created_at, updated_at
      `,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found."
      });
    }

    res.json({
      status: "success",
      message: "Order status updated.",
      order: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/reports
 * Returns forum reports.
 */
async function getForumReports(req, res, next) {
  try {
    const { status } = req.query;

    const values = [];
    const conditions = [];

    if (status) {
      values.push(status);
      conditions.push(`fr.status = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.query(
      `
      SELECT
        fr.id,
        fr.reporter_id,
        fr.target_type,
        fr.target_id,
        fr.reason,
        fr.status,
        fr.reviewed_by,
        fr.admin_note,
        fr.created_at,
        fr.reviewed_at,

        reporter.full_name AS reporter_name,
        reporter.email AS reporter_email,

        reviewer.full_name AS reviewer_name,

        CASE
          WHEN fr.target_type = 'question' THEN fq.title
          WHEN fr.target_type = 'answer' THEN fa.body
          ELSE NULL
        END AS target_preview

      FROM forum_reports fr

      JOIN users reporter
        ON reporter.id = fr.reporter_id

      LEFT JOIN users reviewer
        ON reviewer.id = fr.reviewed_by

      LEFT JOIN forum_questions fq
        ON fr.target_type = 'question'
        AND fq.id = fr.target_id

      LEFT JOIN forum_answers fa
        ON fr.target_type = 'answer'
        AND fa.id = fr.target_id

      ${whereClause}

      ORDER BY fr.created_at DESC
      `,
      values
    );

    res.json({
      status: "success",
      count: result.rows.length,
      reports: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/reports/:id
 * Body:
 * {
 *   "status": "reviewed",
 *   "admin_note": "Handled."
 * }
 */
async function updateForumReport(req, res, next) {
  try {
    const reportId = req.params.id;
    const { status, admin_note } = req.body;

    if (!ALLOWED_REPORT_STATUS.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid report status."
      });
    }

    const result = await db.query(
      `
      UPDATE forum_reports
      SET
        status = $1,
        admin_note = $2,
        reviewed_by = $3,
        reviewed_at = NOW()
      WHERE id = $4
      RETURNING
        id,
        reporter_id,
        target_type,
        target_id,
        reason,
        status,
        reviewed_by,
        admin_note,
        created_at,
        reviewed_at
      `,
      [status, admin_note || null, req.user.id, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Report not found."
      });
    }

    res.json({
      status: "success",
      message: "Report updated.",
      report: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/forum/questions/:id/status
 * Body:
 * {
 *   "status": "hidden"
 * }
 */
async function updateQuestionStatus(req, res, next) {
  try {
    const questionId = req.params.id;
    const { status } = req.body;

    if (!ALLOWED_QUESTION_STATUS.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid question status."
      });
    }

    const result = await db.query(
      `
      UPDATE forum_questions
      SET status = $1
      WHERE id = $2
      RETURNING id, title, status, updated_at
      `,
      [status, questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Question not found."
      });
    }

    res.json({
      status: "success",
      message: "Question status updated.",
      question: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/forum/answers/:id/status
 * Body:
 * {
 *   "status": "hidden"
 * }
 */
async function updateAnswerStatus(req, res, next) {
  try {
    const answerId = req.params.id;
    const { status } = req.body;

    if (!ALLOWED_ANSWER_STATUS.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid answer status."
      });
    }

    const result = await db.query(
      `
      UPDATE forum_answers
      SET status = $1
      WHERE id = $2
      RETURNING id, question_id, status, updated_at
      `,
      [status, answerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Answer not found."
      });
    }

    res.json({
      status: "success",
      message: "Answer status updated.",
      answer: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};