/**
 * admin-books.js
 * ----------------------------------------------------
 * Handles Admin Books page.
 *
 * Features:
 * - Admin-only protection
 * - Load books
 * - Search/filter books
 * - Add book
 * - Edit book
 * - Activate/deactivate book
 */

let allBooks = [];
let allModules = [];

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  setupBookPageEvents();
  await loadModulesForSelect();
  await loadBooks();
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

function setupBookPageEvents() {
  const form = document.getElementById("bookForm");
  const resetButton = document.getElementById("resetBookFormButton");
  const searchInput = document.getElementById("bookSearch");
  const statusFilter = document.getElementById("bookStatusFilter");
  const refreshButton = document.getElementById("refreshBooksButton");

  if (form) {
    form.addEventListener("submit", saveBook);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetBookForm);
  }

  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadBooks, 400));
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", loadBooks);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadBooks);
  }
}

async function loadModulesForSelect() {
  const moduleSelect = document.getElementById("recommendedModule");

  try {
    const data = await apiRequest("/modules");

    allModules = data.modules || [];

    moduleSelect.innerHTML = `<option value="">No module</option>`;

    allModules.forEach((module) => {
      const option = document.createElement("option");
      option.value = module.id;
      option.textContent = `${module.title} (${module.module_code})`;
      moduleSelect.appendChild(option);
    });
  } catch (error) {
    showMessage("Could not load modules for book recommendation.", "error");
  }
}

async function loadBooks() {
  const tableBody = document.getElementById("booksTableBody");
  const searchInput = document.getElementById("bookSearch");
  const statusFilter = document.getElementById("bookStatusFilter");

  tableBody.innerHTML = `
    <tr>
      <td colspan="7">Loading books...</td>
    </tr>
  `;

  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  if (statusFilter && statusFilter.value) {
    params.append("status", statusFilter.value);
  }

  const endpoint = params.toString()
    ? `/admin/books?${params.toString()}`
    : "/admin/books";

  try {
    const data = await apiRequest(endpoint);

    allBooks = data.books || [];

    renderBooks(allBooks);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">Could not load books.</td>
      </tr>
    `;

    showMessage(error.message, "error");
  }
}

function renderBooks(books) {
  const tableBody = document.getElementById("booksTableBody");

  if (!books.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No books found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = books.map(createBookRow).join("");

  document.querySelectorAll("[data-edit-book]").forEach((button) => {
    button.addEventListener("click", () => {
      const bookId = button.getAttribute("data-edit-book");
      const book = allBooks.find((item) => item.id === bookId);

      if (book) {
        fillBookForm(book);
      }
    });
  });

  document.querySelectorAll("[data-toggle-book]").forEach((button) => {
    button.addEventListener("click", async () => {
      const bookId = button.getAttribute("data-toggle-book");
      const newStatus = button.getAttribute("data-new-status") === "true";

      await updateBookStatus(bookId, newStatus);
    });
  });
}

function createBookRow(book) {
  const isActive = book.is_active === true;
  const statusText = isActive ? "Active" : "Inactive";
  const statusClass = isActive ? "admin-status-active" : "admin-status-inactive";
  const actionText = isActive ? "Deactivate" : "Activate";
  const newStatus = isActive ? "false" : "true";

  return `
    <tr>
      <td>
        <strong>${escapeHtml(book.title)}</strong>
        <br />
        <span style="color: var(--muted);">
          by ${escapeHtml(book.author)}
        </span>
        <br />
        <span style="color: var(--muted);">
          ISBN: ${escapeHtml(book.isbn || "N/A")}
        </span>
      </td>

      <td>${escapeHtml(book.category || "N/A")}</td>

      <td>
        <strong>RM ${formatMoney(book.price)}</strong>
      </td>

      <td>${book.stock_quantity || 0}</td>

      <td>
        ${
          book.recommended_module_title
            ? `${escapeHtml(book.recommended_module_title)}<br><span style="color: var(--muted);">${escapeHtml(book.recommended_module_code)}</span>`
            : "None"
        }
      </td>

      <td>
        <span class="${statusClass}">
          ${statusText}
        </span>
      </td>

      <td>
        <div class="module-actions">
          <button class="btn btn-secondary" data-edit-book="${book.id}">
            Edit
          </button>

          <button
            class="btn btn-secondary"
            data-toggle-book="${book.id}"
            data-new-status="${newStatus}"
          >
            ${actionText}
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function saveBook(event) {
  event.preventDefault();

  const bookId = document.getElementById("bookId").value;

  const payload = {
    title: document.getElementById("bookTitle").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    isbn: document.getElementById("bookIsbn").value.trim() || null,
    description: document.getElementById("bookDescription").value.trim() || null,
    category: document.getElementById("bookCategory").value.trim(),
    price: Number(document.getElementById("bookPrice").value),
    stock_quantity: Number(document.getElementById("bookStock").value),
    cover_image_url: document.getElementById("bookCoverUrl").value.trim() || null,
    publisher: document.getElementById("bookPublisher").value.trim() || null,
    edition: document.getElementById("bookEdition").value.trim() || null,
    recommended_module_id: document.getElementById("recommendedModule").value || null
  };

  if (!payload.title || !payload.author || !payload.category) {
    showMessage("Title, author, and category are required.", "error");
    return;
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    showMessage("Price must be a valid number.", "error");
    return;
  }

  if (!Number.isInteger(payload.stock_quantity) || payload.stock_quantity < 0) {
    showMessage("Stock quantity must be a whole number.", "error");
    return;
  }

  try {
    if (bookId) {
      await apiRequest(`/admin/books/${bookId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      showMessage("Book updated successfully.", "success");
    } else {
      await apiRequest("/admin/books", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          is_active: true
        })
      });

      showMessage("Book added successfully.", "success");
    }

    resetBookForm();
    await loadBooks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function fillBookForm(book) {
  document.getElementById("bookFormTitle").textContent = "Edit Book";
  document.getElementById("saveBookButton").textContent = "Update Book";

  document.getElementById("bookId").value = book.id;
  document.getElementById("bookTitle").value = book.title || "";
  document.getElementById("bookAuthor").value = book.author || "";
  document.getElementById("bookIsbn").value = book.isbn || "";
  document.getElementById("bookDescription").value = book.description || "";
  document.getElementById("bookCategory").value = book.category || "";
  document.getElementById("bookPrice").value = Number(book.price || 0).toFixed(2);
  document.getElementById("bookStock").value = book.stock_quantity || 0;
  document.getElementById("bookCoverUrl").value = book.cover_image_url || "";
  document.getElementById("bookPublisher").value = book.publisher || "";
  document.getElementById("bookEdition").value = book.edition || "";
  document.getElementById("recommendedModule").value = book.recommended_module_id || "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function resetBookForm() {
  document.getElementById("bookForm").reset();
  document.getElementById("bookId").value = "";
  document.getElementById("bookFormTitle").textContent = "Add New Book";
  document.getElementById("saveBookButton").textContent = "Add Book";
  document.getElementById("recommendedModule").value = "";
}

async function updateBookStatus(bookId, isActive) {
  try {
    await apiRequest(`/admin/books/${bookId}/status`, {
      method: "PUT",
      body: JSON.stringify({
        is_active: isActive
      })
    });

    showMessage("Book status updated.", "success");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminBooksMessage");

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

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
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