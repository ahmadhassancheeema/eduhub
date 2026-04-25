/**
 * orderRoutes.js
 * ----------------------------------------------------
 * Routes for checkout and order history.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  checkout,
  getOrders,
  getOrderById
} = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", protect, checkout);

router.get("/orders", protect, getOrders);

router.get("/orders/:id", protect, getOrderById);

module.exports = router;