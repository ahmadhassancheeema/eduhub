/**
 * adminBookController.js
 * ----------------------------------------------------
 * Handles admin-only bookstore management:
 * - View all books
 * - Add book
 * - Update book
 * - Activate/deactivate book
 */

const db = require("../db");

/**
 * GET /api/admin/books
 * Returns all books for admin.
 *
 * Optional query:
 * - search
 * - status = active | inactive | all
 */
async function getAdminBooks(req, res, next) {
  try {
    const { search, status } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`
        (
          b.title ILIKE $${values.length}
          OR b.author ILIKE $${values.length}
          OR b.isbn ILIKE $${values.length}
          OR b.category ILIKE $${values.length}
          OR b.publisher ILIKE $${values.length}
        )
      `);
    }

    if (status === "active") {
      conditions.push("b.is_active = TRUE");
    }

    if (status === "inactive") {
      conditions.push("b.is_active = FALSE");
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

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
 * POST /api/admin/books
 * Creates a new book.
 */
async function createBook(req, res, next) {
  try {
    const {
      title,
      author,
      isbn,
      description,
      category,
      price,
      stock_quantity,
      cover_image_url,
      publisher,
      edition,
      recommended_module_id,
      is_active
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        status: "error",
        message: "Title, author, and category are required."
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        status: "error",
        message: "Price must be a valid number."
      });
    }

    const stock = Number(stock_quantity || 0);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        status: "error",
        message: "Stock quantity must be a whole number."
      });
    }

    if (recommended_module_id) {
      const moduleCheck = await db.query(
        `
        SELECT id
        FROM modules
        WHERE id = $1
        `,
        [recommended_module_id]
      );

      if (moduleCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Recommended module not found."
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO books (
        title,
        author,
        isbn,
        description,
        category,
        price,
        stock_quantity,
        cover_image_url,
        publisher,
        edition,
        recommended_module_id,
        is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      RETURNING
        id,
        title,
        author,
        isbn,
        description,
        category,
        price,
        stock_quantity,
        cover_image_url,
        publisher,
        edition,
        recommended_module_id,
        is_active,
        created_at,
        updated_at
      `,
      [
        title.trim(),
        author.trim(),
        isbn ? isbn.trim() : null,
        description ? description.trim() : null,
        category.trim(),
        numericPrice.toFixed(2),
        stock,
        cover_image_url ? cover_image_url.trim() : null,
        publisher ? publisher.trim() : null,
        edition ? edition.trim() : null,
        recommended_module_id || null,
        is_active === false ? false : true
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Book created successfully.",
      book: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A book with this ISBN already exists."
      });
    }

    next(error);
  }
}

/**
 * PUT /api/admin/books/:id
 * Updates a book.
 */
async function updateBook(req, res, next) {
  try {
    const bookId = req.params.id;

    const {
      title,
      author,
      isbn,
      description,
      category,
      price,
      stock_quantity,
      cover_image_url,
      publisher,
      edition,
      recommended_module_id
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        status: "error",
        message: "Title, author, and category are required."
      });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        status: "error",
        message: "Price must be a valid number."
      });
    }

    const stock = Number(stock_quantity || 0);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        status: "error",
        message: "Stock quantity must be a whole number."
      });
    }

    if (recommended_module_id) {
      const moduleCheck = await db.query(
        `
        SELECT id
        FROM modules
        WHERE id = $1
        `,
        [recommended_module_id]
      );

      if (moduleCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Recommended module not found."
        });
      }
    }

    const result = await db.query(
      `
      UPDATE books
      SET
        title = $1,
        author = $2,
        isbn = $3,
        description = $4,
        category = $5,
        price = $6,
        stock_quantity = $7,
        cover_image_url = $8,
        publisher = $9,
        edition = $10,
        recommended_module_id = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING
        id,
        title,
        author,
        isbn,
        description,
        category,
        price,
        stock_quantity,
        cover_image_url,
        publisher,
        edition,
        recommended_module_id,
        is_active,
        created_at,
        updated_at
      `,
      [
        title.trim(),
        author.trim(),
        isbn ? isbn.trim() : null,
        description ? description.trim() : null,
        category.trim(),
        numericPrice.toFixed(2),
        stock,
        cover_image_url ? cover_image_url.trim() : null,
        publisher ? publisher.trim() : null,
        edition ? edition.trim() : null,
        recommended_module_id || null,
        bookId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Book not found."
      });
    }

    res.json({
      status: "success",
      message: "Book updated successfully.",
      book: result.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A book with this ISBN already exists."
      });
    }

    next(error);
  }
}

/**
 * PUT /api/admin/books/:id/status
 * Body:
 * {
 *   "is_active": false
 * }
 */
async function updateBookStatus(req, res, next) {
  try {
    const bookId = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_active must be true or false."
      });
    }

    const result = await db.query(
      `
      UPDATE books
      SET
        is_active = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        title,
        author,
        category,
        price,
        stock_quantity,
        is_active,
        updated_at
      `,
      [is_active, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Book not found."
      });
    }

    res.json({
      status: "success",
      message: "Book status updated.",
      book: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminBooks,
  createBook,
  updateBook,
  updateBookStatus
};