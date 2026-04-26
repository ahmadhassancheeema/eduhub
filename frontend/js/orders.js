/**
 * orders.js
 * ----------------------------------------------------
 * Handles student order history page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();
  await loadOrders();
});

function protectPage() {
  const token = localStorage.getItem("eduhub_token");

  if (!token) {
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

async function loadOrders() {
  const container = document.getElementById("ordersContainer");

  container.innerHTML = `<div class="empty-state">Loading orders...</div>`;

  try {
    const data = await apiRequest("/orders");

    if (!data.orders || data.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          You have no orders yet. Go to the Bookstore and checkout.
        </div>
      `;
      return;
    }

    container.innerHTML = data.orders.map(createOrderCard).join("");
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Could not load orders.</div>`;
    showMessage(error.message, "error");
  }
}

function createOrderCard(order) {
  return `
    <article class="order-card card reveal-item reveal-visible" style="animation: slideIn var(--duration-normal) var(--ease-spring);">
      <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: var(--space-4); margin-bottom: var(--space-4);">
        <div>
          <h2>Order #${escapeHtml(order.id.slice(0, 8))}</h2>
          <p>
            <strong>Date:</strong>
            ${formatDate(order.created_at)}
          </p>
          <p>
            <strong>Status:</strong>
            ${escapeHtml(order.status)}
          </p>
          <p>
            <strong>Items:</strong>
            ${order.item_count}
          </p>
        </div>

        <div>
          <div class="book-price">
            RM ${Number(order.total_amount).toFixed(2)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("ordersMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = 'block';

  setTimeout(() => {
    messageBox.style.display = 'none';
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
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