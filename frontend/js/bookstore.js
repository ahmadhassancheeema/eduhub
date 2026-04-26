/**
 * bookstore.js
 * ----------------------------------------------------
 * Handles the EduHub bookstore listing page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectBookstorePage();
  setupLogoutButton();
  await setupBookstorePage();
});

function protectBookstorePage() {
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

async function setupBookstorePage() {
  const searchInput = document.getElementById("bookSearch");
  const categorySelect = document.getElementById("bookCategoryFilter");
  const refreshButton = document.getElementById("refreshBooksButton");

  await loadBookCategories();
  await loadBooks();

  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadBooks, 400));
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", loadBooks);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadBooks);
  }
}

async function loadBookCategories() {
  const categorySelect = document.getElementById("bookCategoryFilter");

  if (!categorySelect) return;

  try {
    const data = await apiRequest("/books/categories");

    categorySelect.innerHTML = `<option value="">All categories</option>`;

    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    showBookstoreMessage(error.message, "error");
  }
}

async function loadBooks() {
  const booksContainer = document.getElementById("booksContainer");
  const searchInput = document.getElementById("bookSearch");
  const categorySelect = document.getElementById("bookCategoryFilter");

  if (!booksContainer) return;

  booksContainer.innerHTML = `<div class="empty-state">Loading books...</div>`;

  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  if (categorySelect && categorySelect.value) {
    params.append("category", categorySelect.value);
  }

  const endpoint = params.toString()
    ? `/books?${params.toString()}`
    : "/books";

  try {
    const data = await apiRequest(endpoint);

    if (!data.books || data.books.length === 0) {
      booksContainer.innerHTML = `
        <div class="empty-state">
          No books found. Try changing your search or filter.
        </div>
      `;
      return;
    }

    booksContainer.innerHTML = data.books.map(createBookCard).join("");

    document.querySelectorAll("[data-add-book]").forEach((button) => {
      button.addEventListener("click", async () => {
        const bookId = button.getAttribute("data-add-book");
        await addBookToCart(bookId);
      });
    });
  } catch (error) {
    booksContainer.innerHTML = `
      <div class="empty-state">
        Could not load books.
      </div>
    `;

    showBookstoreMessage(error.message, "error");
  }
}

function createBookCard(book) {
  const stock = Number(book.stock_quantity || 0);
  const inStock = stock > 0;

  return `
    <article class="book-card reveal-item reveal-visible" style="animation: slideIn var(--duration-normal) var(--ease-spring);">
      <div class="book-cover">
        ${escapeHtml(book.title).charAt(0)}
      </div>

      <div class="module-meta">
        <span class="badge">${escapeHtml(book.category)}</span>
        <span class="badge ${inStock ? "badge-success" : "badge-muted"}">
          ${inStock ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>

      <h2>${escapeHtml(book.title)}</h2>

      <p>by ${escapeHtml(book.author)}</p>

      <p>${escapeHtml(shortenText(book.description, 110))}</p>

      <div>
        <strong>Publisher:</strong> ${escapeHtml(book.publisher || "N/A")}
        <br />
        <strong>Edition:</strong> ${escapeHtml(book.edition || "N/A")}
      </div>

      <div class="book-price">
        RM ${formatMoney(book.price)}
      </div>

      <div class="book-actions">
        <a class="btn btn-secondary" href="book-details.html?id=${book.id}">
          View Details
        </a>

        <button
          class="btn btn-primary"
          data-add-book="${book.id}"
          ${inStock ? "" : "disabled"}
        >
          Add to Cart
        </button>
      </div>
    </article>
  `;
}

async function addBookToCart(bookId) {
  try {
    await apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({
        book_id: bookId,
        quantity: 1
      })
    });

    showBookstoreMessage("Book added to cart.", "success");
  } catch (error) {
    showBookstoreMessage(error.message, "error");
  }
}

function showBookstoreMessage(message, type = "success") {
  const messageBox = document.getElementById("bookstoreMessage");

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

function shortenText(text, maxLength) {
  if (!text) return "No description added.";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

function getBookInitials(title) {
  if (!title) return "B";

  return title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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