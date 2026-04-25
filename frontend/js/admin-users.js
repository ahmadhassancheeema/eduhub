/**
 * admin-users.js
 * ----------------------------------------------------
 * Handles Admin Manage Users page.
 *
 * Features:
 * - Admin-only protection
 * - Load users
 * - Search users
 * - Change user role
 * - Activate/deactivate user
 */

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  setupUserPageEvents();
  await loadUsers();
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

function setupUserPageEvents() {
  const searchInput = document.getElementById("userSearch");
  const refreshButton = document.getElementById("refreshUsersButton");

  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadUsers, 400));
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadUsers);
  }
}

async function loadUsers() {
  const tableBody = document.getElementById("usersTableBody");
  const searchInput = document.getElementById("userSearch");

  tableBody.innerHTML = `
    <tr>
      <td colspan="9">Loading users...</td>
    </tr>
  `;

  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  const endpoint = params.toString()
    ? `/admin/users?${params.toString()}`
    : "/admin/users";

  try {
    const data = await apiRequest(endpoint);

    if (!data.users || data.users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9">No users found.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = data.users.map(createUserRow).join("");

    document.querySelectorAll("[data-role-user]").forEach((select) => {
      select.addEventListener("change", async () => {
        const userId = select.getAttribute("data-role-user");
        const role = select.value;
        await updateUserRole(userId, role);
      });
    });

    document.querySelectorAll("[data-toggle-user]").forEach((button) => {
      button.addEventListener("click", async () => {
        const userId = button.getAttribute("data-toggle-user");
        const newStatus = button.getAttribute("data-new-status") === "true";
        await updateUserStatus(userId, newStatus);
      });
    });
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9">Could not load users.</td>
      </tr>
    `;

    showMessage(error.message, "error");
  }
}

function createUserRow(user) {
  const isActive = user.is_active === true;
  const statusText = isActive ? "Active" : "Inactive";
  const statusClass = isActive ? "admin-status-active" : "admin-status-inactive";
  const newStatus = isActive ? "false" : "true";
  const actionText = isActive ? "Deactivate" : "Activate";

  return `
    <tr>
      <td>${escapeHtml(user.full_name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.student_id || "N/A")}</td>
      <td>${escapeHtml(user.program || "N/A")}</td>
      <td>${escapeHtml(user.year_of_study || "N/A")}</td>

      <td>
        <span class="admin-role-badge">
          ${escapeHtml(user.role)}
        </span>
      </td>

      <td>
        <span class="${statusClass}">
          ${statusText}
        </span>
      </td>

      <td>
        <select data-role-user="${user.id}">
          <option value="student" ${user.role === "student" ? "selected" : ""}>student</option>
          <option value="moderator" ${user.role === "moderator" ? "selected" : ""}>moderator</option>
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
        </select>
      </td>

      <td>
        <button
          class="btn btn-secondary"
          data-toggle-user="${user.id}"
          data-new-status="${newStatus}"
        >
          ${actionText}
        </button>
      </td>
    </tr>
  `;
}

async function updateUserRole(userId, role) {
  try {
    await apiRequest(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    });

    showMessage("User role updated.", "success");
    await loadUsers();
  } catch (error) {
    showMessage(error.message, "error");
    await loadUsers();
  }
}

async function updateUserStatus(userId, isActive) {
  try {
    await apiRequest(`/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({
        is_active: isActive
      })
    });

    showMessage("User status updated.", "success");
    await loadUsers();
  } catch (error) {
    showMessage(error.message, "error");
    await loadUsers();
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminUsersMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
}

function debounce(callback, delay) {
  let timeoutId;

  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}