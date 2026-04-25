/**
 * cartController.js
 * ----------------------------------------------------
 * Handles student cart features:
 * - Get cart
 * - Add to cart
 * - Update quantity
 * - Remove cart item
 * - Clear cart
 */

const db = require("../db");

/**
 * GET /api/cart
 * Gets logged-in student's cart.
 */
async function getCart(req, res, next) {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT
        ci.id,
        ci.student_id,
        ci.book_id,
        ci.quantity,
        ci.created_at,
        ci.updated_at,

        b.title,
        b.author,
        b.category,
        b.price,
        b.stock_quantity,
        b.cover_image_url,
        b.is_active,

        (ci.quantity * b.price)::NUMERIC(10,2) AS subtotal

      FROM cart_items ci
      JOIN books b
        ON b.id = ci.book_id

      WHERE ci.student_id = $1

      ORDER BY ci.created_at DESC
      `,
      [studentId]
    );

    const items = result.rows;

    const totalAmount = items.reduce((sum, item) => {
      return sum + Number(item.subtotal || 0);
    }, 0);

    res.json({
      status: "success",
      count: items.length,
      total_amount: Number(totalAmount.toFixed(2)),
      items
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart
 * Adds a book to cart.
 *
 * Body:
 * {
 *   "book_id": "...",
 *   "quantity": 1
 * }
 */
async function addToCart(req, res, next) {
  try {
    const studentId = req.user.id;
    const { book_id, quantity } = req.body;

    const requestedQuantity = Number(quantity || 1);

    if (!book_id) {
      return res.status(400).json({
        status: "error",
        message: "book_id is required."
      });
    }

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be a positive whole number."
      });
    }

    const bookResult = await db.query(
      `
      SELECT id, title, stock_quantity, is_active
      FROM books
      WHERE id = $1
        AND is_active = TRUE
      `,
      [book_id]
    );

    const book = bookResult.rows[0];

    if (!book) {
      return res.status(404).json({
        status: "error",
        message: "Book not found."
      });
    }

    if (book.stock_quantity < requestedQuantity) {
      return res.status(400).json({
        status: "error",
        message: "Not enough stock available."
      });
    }

    const result = await db.query(
      `
      INSERT INTO cart_items (student_id, book_id, quantity)
      VALUES ($1, $2, $3)

      ON CONFLICT (student_id, book_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = NOW()

      RETURNING id, student_id, book_id, quantity, created_at, updated_at
      `,
      [studentId, book_id, requestedQuantity]
    );

    const updatedCartItem = result.rows[0];

    if (updatedCartItem.quantity > book.stock_quantity) {
      await db.query(
        `
        UPDATE cart_items
        SET quantity = $1,
            updated_at = NOW()
        WHERE id = $2
        `,
        [book.stock_quantity, updatedCartItem.id]
      );

      return res.status(400).json({
        status: "error",
        message: `Only ${book.stock_quantity} copies are available. Cart quantity was limited to available stock.`
      });
    }

    res.status(201).json({
      status: "success",
      message: "Book added to cart.",
      cart_item: updatedCartItem
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/cart/:id
 * Updates cart item quantity.
 *
 * Body:
 * {
 *   "quantity": 2
 * }
 */
async function updateCartItem(req, res, next) {
  try {
    const studentId = req.user.id;
    const cartItemId = req.params.id;
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be a positive whole number."
      });
    }

    const cartItemResult = await db.query(
      `
      SELECT
        ci.id,
        ci.book_id,
        b.stock_quantity
      FROM cart_items ci
      JOIN books b
        ON b.id = ci.book_id
      WHERE ci.id = $1
        AND ci.student_id = $2
      `,
      [cartItemId, studentId]
    );

    const cartItem = cartItemResult.rows[0];

    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found."
      });
    }

    if (quantity > cartItem.stock_quantity) {
      return res.status(400).json({
        status: "error",
        message: `Only ${cartItem.stock_quantity} copies are available.`
      });
    }

    const result = await db.query(
      `
      UPDATE cart_items
      SET quantity = $1,
          updated_at = NOW()
      WHERE id = $2
        AND student_id = $3
      RETURNING id, student_id, book_id, quantity, created_at, updated_at
      `,
      [quantity, cartItemId, studentId]
    );

    res.json({
      status: "success",
      message: "Cart item updated.",
      cart_item: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/:id
 * Removes one cart item.
 */
async function removeCartItem(req, res, next) {
  try {
    const studentId = req.user.id;
    const cartItemId = req.params.id;

    const result = await db.query(
      `
      DELETE FROM cart_items
      WHERE id = $1
        AND student_id = $2
      RETURNING id
      `,
      [cartItemId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found."
      });
    }

    res.json({
      status: "success",
      message: "Cart item removed."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart
 * Clears the logged-in student's cart.
 */
async function clearCart(req, res, next) {
  try {
    const studentId = req.user.id;

    await db.query(
      `
      DELETE FROM cart_items
      WHERE student_id = $1
      `,
      [studentId]
    );

    res.json({
      status: "success",
      message: "Cart cleared."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};