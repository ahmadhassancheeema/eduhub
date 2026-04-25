/**
 * admin-orders.js
 * ----------------------------------------------------
 * Handles Admin Manage Orders page.
 *
 * Features:
 * - Admin-only protection
 * - Load all orders
 * - Filter/search orders on frontend
 * - Update order status
 */

let allOrders = [];

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  setupOrderPageEvents();
  await loadOrders();
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

function setupOrderPageEvents() {
  const searchInput = document.getElementById("orderSearch");
  const statusFilter = document.getElementById("statusFilter");
  const refreshButton = document.getElementById("refreshOrdersButton");

  if (searchInput) {
    searchInput.addEventListener("input", renderFilteredOrders);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", renderFilteredOrders);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadOrders);
  }
}

async function loadOrders() {
  const tableBody = document.getElementById("ordersTableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="8">Loading orders...</td>
    </tr>
  `;

  try {
    const data = await apiRequest("/admin/orders");

    allOrders = data.orders || [];

    renderFilteredOrders();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Could not load orders.</td>
      </tr>
    `;

    showMessage(error.message, "error");
  }
}

function renderFilteredOrders() {
  const searchInput = document.getElementById("orderSearch");
  const statusFilter = document.getElementById("statusFilter");

  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const status = statusFilter ? statusFilter.value : "";

  let filteredOrders = [...allOrders];

  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status);
  }

  if (search) {
    filteredOrders = filteredOrders.filter((order) => {
      return (
        String(order.id || "").toLowerCase().includes(search) ||
        String(order.student_name || "").toLowerCase().includes(search) ||
        String(order.student_email || "").toLowerCase().includes(search) ||
        String(order.status || "").toLowerCase().includes(search)
      );
    });
  }

  renderOrders(filteredOrders);
}

function renderOrders(orders) {
  const tableBody = document.getElementById("ordersTableBody");

  if (!orders.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">No orders found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = orders.map(createOrderRow).join("");

  document.querySelectorAll("[data-order-status]").forEach((select) => {
    select.addEventListener("change", async () => {
      const orderId = select.getAttribute("data-order-status");
      const status = select.value;

      await updateOrderStatus(orderId, status);
    });
  });
}

function createOrderRow(order) {
  return `
    <tr>
      <td>${escapeHtml(shortId(order.id))}</td>

      <td>${escapeHtml(order.student_name || "N/A")}</td>

      <td>${escapeHtml(order.student_email || "N/A")}</td>

      <td>
        <strong>RM ${formatMoney(order.total_amount)}</strong>
      </td>

      <td>${order.item_count || 0}</td>

      <td>
        <span class="admin-role-badge">
          ${escapeHtml(order.status)}
        </span>
      </td>

      <td>${formatDate(order.created_at)}</td>

      <td>
        <select data-order-status="${order.id}">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>pending</option>
          <option value="completed" ${order.status === "completed" ? "selected" : ""}>completed</option>
          <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>cancelled</option>
        </select>
      </td>
    </tr>
  `;
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiRequest(`/admin/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    showMessage("Order status updated.", "success");
    await loadOrders();
  } catch (error) {
    showMessage(error.message, "error");
    await loadOrders();
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminOrdersMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
}

function shortId(id) {
  if (!id) return "N/A";
  return id.slice(0, 8);
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
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