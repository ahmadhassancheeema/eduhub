/**
 * cartRoutes.js
 * ----------------------------------------------------
 * Routes for student cart.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.put("/:id", protect, updateCartItem);

router.delete("/:id", protect, removeCartItem);

router.delete("/", protect, clearCart);

module.exports = router;