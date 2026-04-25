/**
 * admin.js
 * ----------------------------------------------------
 * Handles Admin Dashboard page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  await loadAdminDashboard();
});

async function protectAdminPage() {
  const token = localStorage.getItem("eduhub_token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const data = await apiRequest("/auth/me");

    if (!data.user || data.user.role !== "admin") {
      alert("Admin access required.");
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    localStorage.removeItem("eduhub_token");
    localStorage.removeItem("eduhub_user");
    window.location.href = "login.html";
  }
}

function setupLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) return;

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("eduhub_token");
    localStorage.removeItem("eduhub_user");
    window.location.href = "login.html";
  });
}

async function loadAdminDashboard() {
  try {
    const data = await apiRequest("/admin/dashboard");
    const analytics = data.analytics;

    document.getElementById("totalUsers").textContent =
      analytics.users.total_users || 0;

    document.getElementById("totalModules").textContent =
      analytics.modules.total_modules || 0;

    document.getElementById("totalBooks").textContent =
      analytics.books.total_books || 0;

    document.getElementById("totalOrders").textContent =
      analytics.orders.total_orders || 0;

    document.getElementById("totalSales").textContent =
      `RM ${Number(analytics.orders.total_sales || 0).toFixed(2)}`;

    document.getElementById("totalQuestions").textContent =
      analytics.forum.total_questions || 0;

    document.getElementById("pendingReports").textContent =
      analytics.reports.pending_reports || 0;

    document.getElementById("inactiveUsers").textContent =
      analytics.users.inactive_users || 0;
  } catch (error) {
    showAdminMessage(error.message, "error");
  }
}

function showAdminMessage(message, type = "success") {
  const messageBox = document.getElementById("adminMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
}