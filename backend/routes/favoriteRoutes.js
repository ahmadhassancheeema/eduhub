/**
 * favoriteRoutes.js
 * ----------------------------------------------------
 * Routes for student favorite items.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getFavorites,
  addFavorite,
  removeFavoriteById,
  removeFavoriteByItem
} = require("../controllers/favoriteController");

const router = express.Router();

router.get("/", protect, getFavorites);

router.post("/", protect, addFavorite);

router.delete("/:id", protect, removeFavoriteById);

router.delete("/", protect, removeFavoriteByItem);

module.exports = router;