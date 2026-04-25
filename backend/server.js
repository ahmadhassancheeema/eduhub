/**
 * server.js
 * ----------------------------------------------------
 * Main Express server for EduHub.
 *
 * Current completed parts:
 * - Express app setup
 * - CORS
 * - JSON body parsing
 * - Database test route
 * - Authentication routes
 * - Learning Wing routes
 * - Progress routes
 * - Favorites routes
 * - 404 handler
 * - Global error handler
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookRoutes = require("./routes/bookRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const forumRoutes = require("./routes/forumRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminBookRoutes = require("./routes/adminBookRoutes");
const adminLearningRoutes = require("./routes/adminLearningRoutes");

const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

/**
 * CORS setup
 * This allows your frontend Live Server to communicate with the backend.
 */
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000"
    ],
    credentials: true
  })
);

/**
 * Allows Express to read JSON request bodies.
 */
app.use(express.json());

/**
 * Root test route.
 */
app.get("/", (req, res) => {
  res.json({
    message: "EduHub backend is running",
    status: "success"
  });
});

/**
 * Health check route.
 */
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is healthy",
    status: "success",
    uptime: process.uptime()
  });
});

/**
 * Database test route.
 * This confirms Express can connect to Supabase PostgreSQL.
 */
app.get("/api/db-test", async (req, res, next) => {
  try {
    const result = await db.query("SELECT NOW() AS current_time");

    res.json({
      message: "Database connection successful",
      current_time: result.rows[0].current_time
    });
  } catch (error) {
    next(error);
  }
});

/**
 * API routes.
 */
app.use("/api/auth", authRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/books", adminBookRoutes);
app.use("/api/admin/learning", adminLearningRoutes);

/**
 * 404 handler.
 * Runs when no route matches the request.
 */
app.use(notFoundMiddleware);

/**
 * Global error handler.
 */
app.use(errorMiddleware);

/**
 * Start server.
 */
app.listen(PORT, () => {
  console.log(`EduHub backend server is running on port ${PORT}`);
});