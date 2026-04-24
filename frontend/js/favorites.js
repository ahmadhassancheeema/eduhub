/**
 * favorites.js
 * ----------------------------------------------------
 * Handles the Favorites page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectFavoritesPage();
  setupLogoutButton();
  await loadFavorites();
});

function protectFavoritesPage() {
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

async function loadFavorites() {
  const container = document.getElementById("favoritesContainer");

  if (!container) return;

  container.innerHTML = `<div class="empty-state">Loading favorites...</div>`;

  try {
    const data = await apiRequest("/favorites");

    if (!data.favorites || data.favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          You have not saved any favorites yet.
          <br />
          Go to the Learning Wing and save modules or resources.
        </div>
      `;
      return;
    }

    container.innerHTML = data.favorites.map(createFavoriteCard).join("");

    document.querySelectorAll("[data-remove-favorite]").forEach((button) => {
      button.addEventListener("click", async () => {
        const favoriteId = button.getAttribute("data-remove-favorite");
        await removeFavorite(favoriteId);
      });
    });
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        Could not load favorites.
      </div>
    `;

    showFavoritesMessage(error.message, "error");
  }
}

function createFavoriteCard(favorite) {
  const title = favorite.item_title || "Untitled item";
  const description = favorite.item_description || "No description available.";

  let openLink = "#";
  let openText = "Open";

  if (favorite.item_type === "module") {
    openLink = `module-details.html?id=${favorite.item_id}`;
    openText = "Open Module";
  }

  if (favorite.item_type === "resource") {
    openLink =
      favorite.external_url ||
      favorite.file_url ||
      `module-details.html?id=${favorite.resource_module_id}`;

    openText = favorite.external_url || favorite.file_url
      ? "Open Resource"
      : "Open Module";
  }

  return `
    <article class="module-card">
      <div class="module-meta">
        <span class="badge">${escapeHtml(favorite.item_type)}</span>
        ${
          favorite.module_code
            ? `<span class="badge badge-muted">${escapeHtml(favorite.module_code)}</span>`
            : ""
        }
        ${
          favorite.resource_type
            ? `<span class="badge badge-muted">${escapeHtml(favorite.resource_type)}</span>`
            : ""
        }
        ${
          favorite.category_name
            ? `<span class="badge badge-muted">${escapeHtml(favorite.category_name)}</span>`
            : ""
        }
      </div>

      <h2>${escapeHtml(title)}</h2>

      <p>${escapeHtml(description)}</p>

      <div class="module-actions">
        <a
          class="btn btn-primary"
          href="${openLink}"
          ${favorite.item_type === "resource" && (favorite.external_url || favorite.file_url) ? 'target="_blank" rel="noopener"' : ""}
        >
          ${openText}
        </a>

        <button class="btn btn-secondary" data-remove-favorite="${favorite.id}">
          Remove
        </button>
      </div>
    </article>
  `;
}

async function removeFavorite(favoriteId) {
  try {
    await apiRequest(`/favorites/${favoriteId}`, {
      method: "DELETE"
    });

    showFavoritesMessage("Favorite removed.", "success");
    await loadFavorites();
  } catch (error) {
    showFavoritesMessage(error.message, "error");
  }
}

function showFavoritesMessage(message, type = "success") {
  const messageBox = document.getElementById("favoritesMessage");

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