/**
 * orderController.js
 * ----------------------------------------------------
 * Handles simulated checkout and student orders.
 *
 * Checkout is simulated:
 * - No real payment
 * - No payment gateway
 * - No card information
 */

const db = require("../db");

/**
 * POST /api/checkout
 * Creates an order from cart items.
 */
async function checkout(req, res, next) {
  const client = await db.pool.connect();

  try {
    const studentId = req.user.id;

    await client.query("BEGIN");

    const cartResult = await client.query(
      `
      SELECT
        ci.id AS cart_item_id,
        ci.book_id,
        ci.quantity,
        b.title,
        b.price,
        b.stock_quantity,
        b.is_active
      FROM cart_items ci
      JOIN books b
        ON b.id = ci.book_id
      WHERE ci.student_id = $1
      ORDER BY ci.created_at ASC
      `,
      [studentId]
    );

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        status: "error",
        message: "Your cart is empty."
      });
    }

    for (const item of cartItems) {
      if (!item.is_active) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          status: "error",
          message: `${item.title} is no longer available.`
        });
      }

      if (item.quantity > item.stock_quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          status: "error",
          message: `Not enough stock for ${item.title}.`
        });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    const orderResult = await client.query(
      `
      INSERT INTO orders (student_id, total_amount, status)
      VALUES ($1, $2, 'completed')
      RETURNING id, student_id, total_amount, status, created_at, updated_at
      `,
      [studentId, totalAmount.toFixed(2)]
    );

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        `
        INSERT INTO order_items
          (order_id, book_id, quantity, price_at_purchase)
        VALUES
          ($1, $2, $3, $4)
        `,
        [order.id, item.book_id, item.quantity, item.price]
      );

      await client.query(
        `
        UPDATE books
        SET stock_quantity = stock_quantity - $1,
            updated_at = NOW()
        WHERE id = $2
        `,
        [item.quantity, item.book_id]
      );
    }

    await client.query(
      `
      DELETE FROM cart_items
      WHERE student_id = $1
      `,
      [studentId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      status: "success",
      message: "Checkout completed successfully.",
      order
    });
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders
 * Gets logged-in student's order history.
 */
async function getOrders(req, res, next) {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `
      SELECT
        o.id,
        o.student_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id)::INTEGER AS item_count
      FROM orders o
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      WHERE o.student_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [studentId]
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
 * GET /api/orders/:id
 * Gets one order with its items.
 */
async function getOrderById(req, res, next) {
  try {
    const studentId = req.user.id;
    const orderId = req.params.id;

    const orderResult = await db.query(
      `
      SELECT
        id,
        student_id,
        total_amount,
        status,
        created_at,
        updated_at
      FROM orders
      WHERE id = $1
        AND student_id = $2
      `,
      [orderId, studentId]
    );

    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found."
      });
    }

    const itemsResult = await db.query(
      `
      SELECT
        oi.id,
        oi.order_id,
        oi.book_id,
        oi.quantity,
        oi.price_at_purchase,
        oi.created_at,
        b.title,
        b.author,
        b.category,
        b.cover_image_url,
        (oi.quantity * oi.price_at_purchase)::NUMERIC(10,2) AS subtotal
      FROM order_items oi
      LEFT JOIN books b
        ON b.id = oi.book_id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
      `,
      [orderId]
    );

    res.json({
      status: "success",
      order,
      items: itemsResult.rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  getOrders,
  getOrderById
};