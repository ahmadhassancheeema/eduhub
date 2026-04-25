/**
 * forumController.js
 * ----------------------------------------------------
 * Handles EduHub Discussion Forum features:
 * - Categories
 * - Tags
 * - Questions
 * - Answers
 * - Votes
 * - Reports
 */

const db = require("../db");

const ALLOWED_TARGET_TYPES = ["question", "answer"];
const ALLOWED_VOTE_TYPES = ["upvote", "downvote"];

/**
 * Converts a tags value into a clean array.
 * Accepts:
 * - ["html", "css"]
 * - "html, css"
 */
function normalizeTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * GET /api/forum/categories
 * Gets all forum categories.
 */
async function getForumCategories(req, res, next) {
  try {
    const result = await db.query(
      `
      SELECT id, name, description, created_at
      FROM forum_categories
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
 * GET /api/forum/tags
 * Gets all forum tags.
 */
async function getForumTags(req, res, next) {
  try {
    const result = await db.query(
      `
      SELECT id, name
      FROM forum_tags
      ORDER BY name ASC
      `
    );

    res.json({
      status: "success",
      tags: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/forum/questions
 * Gets visible forum questions.
 *
 * Optional query params:
 * - search
 * - category
 * - tag
 */
async function getQuestions(req, res, next) {
  try {
    const { search, category, tag } = req.query;

    const values = [];
    const conditions = ["q.status != 'hidden'"];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(q.title ILIKE $${values.length} OR q.body ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`fc.name = $${values.length}`);
    }

    if (tag) {
      values.push(tag.toLowerCase());
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM question_tags qt_filter
          JOIN forum_tags ft_filter
            ON ft_filter.id = qt_filter.tag_id
          WHERE qt_filter.question_id = q.id
            AND ft_filter.name = $${values.length}
        )
      `);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const result = await db.query(
      `
      SELECT
        q.id,
        q.student_id,
        q.category_id,
        q.title,
        q.body,
        q.status,
        q.view_count,
        q.created_at,
        q.updated_at,

        u.full_name AS author_name,
        fc.name AS category_name,

        COALESCE((
          SELECT COUNT(*)
          FROM forum_answers a
          WHERE a.question_id = q.id
            AND a.status = 'visible'
        ), 0)::INTEGER AS answer_count,

        COALESCE((
          SELECT SUM(
            CASE
              WHEN fv.vote_type = 'upvote' THEN 1
              WHEN fv.vote_type = 'downvote' THEN -1
              ELSE 0
            END
          )
          FROM forum_votes fv
          WHERE fv.target_type = 'question'
            AND fv.target_id = q.id
        ), 0)::INTEGER AS vote_score,

        COALESCE((
          SELECT ARRAY_AGG(ft.name ORDER BY ft.name)
          FROM question_tags qt
          JOIN forum_tags ft
            ON ft.id = qt.tag_id
          WHERE qt.question_id = q.id
        ), ARRAY[]::VARCHAR[]) AS tags

      FROM forum_questions q
      JOIN users u
        ON u.id = q.student_id
      LEFT JOIN forum_categories fc
        ON fc.id = q.category_id

      ${whereClause}

      ORDER BY q.created_at DESC
      `,
      values
    );

    res.json({
      status: "success",
      count: result.rows.length,
      questions: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/forum/questions/:id
 * Gets one question with answers.
 */
async function getQuestionById(req, res, next) {
  try {
    const questionId = req.params.id;

    await db.query(
      `
      UPDATE forum_questions
      SET view_count = view_count + 1
      WHERE id = $1
        AND status != 'hidden'
      `,
      [questionId]
    );

    const questionResult = await db.query(
      `
      SELECT
        q.id,
        q.student_id,
        q.category_id,
        q.title,
        q.body,
        q.status,
        q.view_count,
        q.created_at,
        q.updated_at,

        u.full_name AS author_name,
        fc.name AS category_name,

        COALESCE((
          SELECT SUM(
            CASE
              WHEN fv.vote_type = 'upvote' THEN 1
              WHEN fv.vote_type = 'downvote' THEN -1
              ELSE 0
            END
          )
          FROM forum_votes fv
          WHERE fv.target_type = 'question'
            AND fv.target_id = q.id
        ), 0)::INTEGER AS vote_score,

        COALESCE((
          SELECT ARRAY_AGG(ft.name ORDER BY ft.name)
          FROM question_tags qt
          JOIN forum_tags ft
            ON ft.id = qt.tag_id
          WHERE qt.question_id = q.id
        ), ARRAY[]::VARCHAR[]) AS tags

      FROM forum_questions q
      JOIN users u
        ON u.id = q.student_id
      LEFT JOIN forum_categories fc
        ON fc.id = q.category_id

      WHERE q.id = $1
        AND q.status != 'hidden'
      `,
      [questionId]
    );

    const question = questionResult.rows[0];

    if (!question) {
      return res.status(404).json({
        status: "error",
        message: "Question not found."
      });
    }

    const answersResult = await db.query(
      `
      SELECT
        a.id,
        a.question_id,
        a.student_id,
        a.body,
        a.is_accepted,
        a.status,
        a.created_at,
        a.updated_at,

        u.full_name AS author_name,

        COALESCE((
          SELECT SUM(
            CASE
              WHEN fv.vote_type = 'upvote' THEN 1
              WHEN fv.vote_type = 'downvote' THEN -1
              ELSE 0
            END
          )
          FROM forum_votes fv
          WHERE fv.target_type = 'answer'
            AND fv.target_id = a.id
        ), 0)::INTEGER AS vote_score

      FROM forum_answers a
      JOIN users u
        ON u.id = a.student_id

      WHERE a.question_id = $1
        AND a.status = 'visible'

      ORDER BY a.is_accepted DESC, a.created_at ASC
      `,
      [questionId]
    );

    res.json({
      status: "success",
      question,
      answers: answersResult.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/forum/questions
 * Creates a new question.
 *
 * Body:
 * {
 *   "title": "Question title",
 *   "body": "Question body",
 *   "category_id": "uuid",
 *   "tags": ["html", "css"]
 * }
 */
async function createQuestion(req, res, next) {
  const client = await db.pool.connect();

  try {
    const studentId = req.user.id;
    const { title, body, category_id } = req.body;
    const tags = normalizeTags(req.body.tags);

    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        status: "error",
        message: "Question title must be at least 5 characters."
      });
    }

    if (!body || body.trim().length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Question body must be at least 10 characters."
      });
    }

    if (category_id) {
      const categoryCheck = await db.query(
        `
        SELECT id
        FROM forum_categories
        WHERE id = $1
        `,
        [category_id]
      );

      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Forum category not found."
        });
      }
    }

    await client.query("BEGIN");

    const questionResult = await client.query(
      `
      INSERT INTO forum_questions
        (student_id, category_id, title, body)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, student_id, category_id, title, body, status, view_count, created_at, updated_at
      `,
      [
        studentId,
        category_id || null,
        title.trim(),
        body.trim()
      ]
    );

    const question = questionResult.rows[0];

    for (const tagName of tags) {
      const tagResult = await client.query(
        `
        INSERT INTO forum_tags (name)
        VALUES ($1)
        ON CONFLICT (name)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
        `,
        [tagName]
      );

      const tagId = tagResult.rows[0].id;

      await client.query(
        `
        INSERT INTO question_tags (question_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (question_id, tag_id) DO NOTHING
        `,
        [question.id, tagId]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      status: "success",
      message: "Question posted successfully.",
      question
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

/**
 * POST /api/forum/questions/:id/answers
 * Adds an answer to a question.
 *
 * Body:
 * {
 *   "body": "Answer text"
 * }
 */
async function createAnswer(req, res, next) {
  try {
    const studentId = req.user.id;
    const questionId = req.params.id;
    const { body } = req.body;

    if (!body || body.trim().length < 5) {
      return res.status(400).json({
        status: "error",
        message: "Answer must be at least 5 characters."
      });
    }

    const questionResult = await db.query(
      `
      SELECT id, status
      FROM forum_questions
      WHERE id = $1
        AND status != 'hidden'
      `,
      [questionId]
    );

    const question = questionResult.rows[0];

    if (!question) {
      return res.status(404).json({
        status: "error",
        message: "Question not found."
      });
    }

    if (question.status === "locked" || question.status === "closed") {
      return res.status(403).json({
        status: "error",
        message: "This question is closed or locked."
      });
    }

    const result = await db.query(
      `
      INSERT INTO forum_answers
        (question_id, student_id, body)
      VALUES
        ($1, $2, $3)
      RETURNING id, question_id, student_id, body, is_accepted, status, created_at, updated_at
      `,
      [questionId, studentId, body.trim()]
    );

    res.status(201).json({
      status: "success",
      message: "Answer posted successfully.",
      answer: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/forum/vote
 * Adds or updates a vote.
 *
 * Body:
 * {
 *   "target_type": "question",
 *   "target_id": "uuid",
 *   "vote_type": "upvote"
 * }
 */
async function vote(req, res, next) {
  try {
    const userId = req.user.id;
    const { target_type, target_id, vote_type } = req.body;

    if (!ALLOWED_TARGET_TYPES.includes(target_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid target type."
      });
    }

    if (!ALLOWED_VOTE_TYPES.includes(vote_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid vote type."
      });
    }

    if (!target_id) {
      return res.status(400).json({
        status: "error",
        message: "target_id is required."
      });
    }

    if (target_type === "question") {
      const questionCheck = await db.query(
        `
        SELECT id
        FROM forum_questions
        WHERE id = $1
          AND status != 'hidden'
        `,
        [target_id]
      );

      if (questionCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Question not found."
        });
      }
    }

    if (target_type === "answer") {
      const answerCheck = await db.query(
        `
        SELECT id
        FROM forum_answers
        WHERE id = $1
          AND status = 'visible'
        `,
        [target_id]
      );

      if (answerCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Answer not found."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO forum_votes
        (user_id, target_type, target_id, vote_type)
      VALUES
        ($1, $2, $3, $4)

      ON CONFLICT (user_id, target_type, target_id)
      DO UPDATE SET
        vote_type = EXCLUDED.vote_type

      RETURNING id, user_id, target_type, target_id, vote_type, created_at
      `,
      [userId, target_type, target_id, vote_type]
    );

    res.json({
      status: "success",
      message: "Vote saved.",
      vote: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/forum/report
 * Reports a question or answer.
 *
 * Body:
 * {
 *   "target_type": "question",
 *   "target_id": "uuid",
 *   "reason": "Reason text"
 * }
 */
async function reportContent(req, res, next) {
  try {
    const reporterId = req.user.id;
    const { target_type, target_id, reason } = req.body;

    if (!ALLOWED_TARGET_TYPES.includes(target_type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid target type."
      });
    }

    if (!target_id) {
      return res.status(400).json({
        status: "error",
        message: "target_id is required."
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        status: "error",
        message: "Report reason must be at least 5 characters."
      });
    }

    if (target_type === "question") {
      const questionCheck = await db.query(
        `
        SELECT id
        FROM forum_questions
        WHERE id = $1
        `,
        [target_id]
      );

      if (questionCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Question not found."
        });
      }
    }

    if (target_type === "answer") {
      const answerCheck = await db.query(
        `
        SELECT id
        FROM forum_answers
        WHERE id = $1
        `,
        [target_id]
      );

      if (answerCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Answer not found."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO forum_reports
        (reporter_id, target_type, target_id, reason)
      VALUES
        ($1, $2, $3, $4)

      ON CONFLICT (reporter_id, target_type, target_id)
      DO NOTHING

      RETURNING id, reporter_id, target_type, target_id, reason, status, created_at
      `,
      [reporterId, target_type, target_id, reason.trim()]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "success",
        message: "You have already reported this item."
      });
    }

    res.status(201).json({
      status: "success",
      message: "Report submitted.",
      report: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/forum/my-count
 * Gets current student's question count for dashboard.
 */
async function getMyForumCount(req, res, next) {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT COUNT(*)::INTEGER AS question_count
      FROM forum_questions
      WHERE student_id = $1
      `,
      [studentId]
    );

    res.json({
      status: "success",
      question_count: result.rows[0].question_count
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getForumCategories,
  getForumTags,
  getQuestions,
  getQuestionById,
  createQuestion,
  createAnswer,
  vote,
  reportContent,
  getMyForumCount
};