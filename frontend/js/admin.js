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

    animateValue("totalUsers", 0, analytics.users.total_users || 0, 1000);
    animateValue("totalModules", 0, analytics.modules.total_modules || 0, 1000);
    animateValue("totalBooks", 0, analytics.books.total_books || 0, 1000);
    animateValue("totalOrders", 0, analytics.orders.total_orders || 0, 1000);
    
    // For sales, we can't easily animate floats with the simple helper, so we'll just set it
    document.getElementById("totalSales").textContent =
      `RM ${Number(analytics.orders.total_sales || 0).toFixed(2)}`;

    animateValue("totalQuestions", 0, analytics.forum.total_questions || 0, 1000);
    animateValue("pendingReports", 0, analytics.reports.pending_reports || 0, 1000);
    animateValue("inactiveUsers", 0, analytics.users.inactive_users || 0, 1000);
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

// Helper: Animate number count up
function animateValue(id, start, end, duration) {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  if (end === 0) {
    obj.textContent = '0';
    return;
  }

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    const easeOut = progress * (2 - progress);
    const currentVal = Math.floor(easeOut * (end - start) + start);
    
    obj.textContent = currentVal;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = end;
    }
  };
  window.requestAnimationFrame(step);
}