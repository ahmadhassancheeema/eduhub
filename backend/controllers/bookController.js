/**
 * bookController.js
 * ----------------------------------------------------
 * Handles bookstore book browsing.
 *
 * Phase 4 features:
 * - Get all books
 * - Search/filter books
 * - Get one book details
 */

const db = require("../db");

/**
 * GET /api/books
 * Gets all active books.
 * Optional query params:
 * - search
 * - category
 */
async function getBooks(req, res, next) {
  try {
    const { search, category } = req.query;

    const values = [];
    const conditions = ["b.is_active = TRUE"];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(b.title ILIKE $${values.length} OR b.author ILIKE $${values.length} OR b.description ILIKE $${values.length} OR b.isbn ILIKE $${values.length})`
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`b.category = $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const result = await db.query(
      `
      SELECT
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.description,
        b.category,
        b.price,
        b.stock_quantity,
        b.cover_image_url,
        b.publisher,
        b.edition,
        b.recommended_module_id,
        b.is_active,
        b.created_at,
        b.updated_at,
        m.title AS recommended_module_title,
        m.module_code AS recommended_module_code
      FROM books b
      LEFT JOIN modules m
        ON m.id = b.recommended_module_id
      ${whereClause}
      ORDER BY b.created_at DESC
      `,
      values
    );

    res.json({
      status: "success",
      count: result.rows.length,
      books: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/books/categories
 * Gets distinct book categories.
 */
async function getBookCategories(req, res, next) {
  try {
    const result = await db.query(
      `
      SELECT DISTINCT category
      FROM books
      WHERE is_active = TRUE
      ORDER BY category ASC
      `
    );

    res.json({
      status: "success",
      categories: result.rows.map((row) => row.category)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/books/:id
 * Gets one book by ID.
 */
async function getBookById(req, res, next) {
  try {
    const bookId = req.params.id;

    const result = await db.query(
      `
      SELECT
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.description,
        b.category,
        b.price,
        b.stock_quantity,
        b.cover_image_url,
        b.publisher,
        b.edition,
        b.recommended_module_id,
        b.is_active,
        b.created_at,
        b.updated_at,
        m.title AS recommended_module_title,
        m.module_code AS recommended_module_code
      FROM books b
      LEFT JOIN modules m
        ON m.id = b.recommended_module_id
      WHERE b.id = $1
        AND b.is_active = TRUE
      `,
      [bookId]
    );

    const book = result.rows[0];

    if (!book) {
      return res.status(404).json({
        status: "error",
        message: "Book not found."
      });
    }

    res.json({
      status: "success",
      book
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBooks,
  getBookCategories,
  getBookById
};