/**
 * cart.js
 * ----------------------------------------------------
 * Handles cart page, update quantity, remove item, clear cart, checkout.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();
  setupCartActions();
  await loadCart();
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

function setupCartActions() {
  const checkoutButton = document.getElementById("checkoutButton");
  const clearCartButton = document.getElementById("clearCartButton");

  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout);
  }

  if (clearCartButton) {
    clearCartButton.addEventListener("click", clearCart);
  }
}

async function loadCart() {
  const container = document.getElementById("cartContainer");

  container.innerHTML = `<div class="empty-state">Loading cart...</div>`;

  try {
    const data = await apiRequest("/cart");

    document.getElementById("cartTotal").textContent =
      Number(data.total_amount || 0).toFixed(2);

    if (!data.items || data.items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          Your cart is empty. Go to the Bookstore and add books.
        </div>
      `;
      return;
    }

    container.innerHTML = data.items.map(createCartItem).join("");

    document.querySelectorAll("[data-update-cart]").forEach((button) => {
      button.addEventListener("click", async () => {
        const cartItemId = button.getAttribute("data-update-cart");
        const input = document.querySelector(`[data-quantity-input="${cartItemId}"]`);
        await updateCartItem(cartItemId, Number(input.value));
      });
    });

    document.querySelectorAll("[data-remove-cart]").forEach((button) => {
      button.addEventListener("click", async () => {
        const cartItemId = button.getAttribute("data-remove-cart");
        await removeCartItem(cartItemId);
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Could not load cart.</div>`;
    showMessage(error.message, "error");
  }
}

function createCartItem(item) {
  return `
    <article class="cart-item">
      <div class="cart-item-top">
        <div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>by ${escapeHtml(item.author)}</p>
          <p>${escapeHtml(item.category)}</p>
          <p>
            <strong>Price:</strong> RM ${Number(item.price).toFixed(2)}
            |
            <strong>Subtotal:</strong> RM ${Number(item.subtotal).toFixed(2)}
          </p>
          <p>
            <strong>Available stock:</strong> ${item.stock_quantity}
          </p>
        </div>

        <div class="quantity-control">
          <input
            type="number"
            min="1"
            max="${item.stock_quantity}"
            value="${item.quantity}"
            data-quantity-input="${item.id}"
          />

          <button class="btn btn-secondary" data-update-cart="${item.id}">
            Update
          </button>

          <button class="btn btn-secondary" data-remove-cart="${item.id}">
            Remove
          </button>
        </div>
      </div>
    </article>
  `;
}

async function updateCartItem(cartItemId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    showMessage("Quantity must be at least 1.", "error");
    return;
  }

  try {
    await apiRequest(`/cart/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity })
    });

    showMessage("Cart item updated.", "success");
    await loadCart();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function removeCartItem(cartItemId) {
  try {
    await apiRequest(`/cart/${cartItemId}`, {
      method: "DELETE"
    });

    showMessage("Cart item removed.", "success");
    await loadCart();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function clearCart() {
  try {
    await apiRequest("/cart", {
      method: "DELETE"
    });

    showMessage("Cart cleared.", "success");
    await loadCart();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function checkout() {
  try {
    await apiRequest("/checkout", {
      method: "POST"
    });

    showMessage("Checkout completed successfully.", "success");

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 800);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("cartMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
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