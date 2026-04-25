/**
 * dashboard.js
 * ----------------------------------------------------
 * Handles the protected student dashboard.
 *
 * Current features:
 * - Protects dashboard from guests
 * - Loads logged-in user profile
 * - Loads real learning progress from backend
 * - Loads real bookstore order count
 * - Updates dashboard stats
 */

document.addEventListener("DOMContentLoaded", async () => {
  requireAuth();

  await loadDashboardProfile();
  await loadDashboardProgress();
  await loadDashboardOrders();
});

/**
 * Loads the logged-in student's profile from the backend.
 */
async function loadDashboardProfile() {
  try {
    const data = await apiRequest("/auth/me");

    const user = data.user;

    document.getElementById("welcomeTitle").textContent = `Welcome, ${user.full_name}`;

    document.getElementById("profileName").textContent = user.full_name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileStudentId").textContent = user.student_id;
    document.getElementById("profileProgram").textContent = user.program || "Not added";
    document.getElementById("profileYear").textContent = user.year_of_study || "Not added";
    document.getElementById("profileRole").textContent = user.role;

    localStorage.setItem("eduhub_user", JSON.stringify(user));
  } catch (error) {
    console.error("Profile loading error:", error);
    logout();
  }
}

/**
 * Loads real learning progress from the backend.
 */
async function loadDashboardProgress() {
  try {
    const data = await apiRequest("/progress");

    const progress = data.progress;

    document.getElementById("overallProgress").textContent =
      `${progress.overall_progress_percentage || 0}%`;

    document.getElementById("modulesStarted").textContent =
      progress.modules_started || 0;

    document.getElementById("completedLessons").textContent =
      progress.completed_lessons || 0;

    // These features are coming in later phases.
    document.getElementById("favoriteItems").textContent = "0";
    document.getElementById("forumQuestions").textContent = "0";
  } catch (error) {
    console.error("Progress loading error:", error);

    document.getElementById("overallProgress").textContent = "0%";
    document.getElementById("modulesStarted").textContent = "0";
    document.getElementById("completedLessons").textContent = "0";
  }
}

/**
 * Loads bookstore order information from the backend.
 */
async function loadDashboardOrders() {
  try {
    const data = await apiRequest("/orders");

    const orders = data.orders || [];

    const totalBooksPurchased = orders.reduce((total, order) => {
      return total + Number(order.item_count || 0);
    }, 0);

    document.getElementById("booksPurchased").textContent = totalBooksPurchased;
  } catch (error) {
    console.error("Orders loading error:", error);
    document.getElementById("booksPurchased").textContent = "0";
  }
}