/**
 * book-details.js
 * ----------------------------------------------------
 * Handles the book detail page.
 */

let currentBookId = null;
let currentBook = null;

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();

  currentBookId = getBookIdFromUrl();

  if (!currentBookId) {
    showMessage("Book ID is missing from the URL.", "error");
    return;
  }

  await loadBookDetails();
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

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadBookDetails() {
  try {
    const data = await apiRequest(`/books/${currentBookId}`);
    currentBook = data.book;

    document.getElementById("bookTitle").textContent = currentBook.title;
    document.getElementById("bookDescription").textContent =
      currentBook.description || "No description available.";

    document.getElementById("bookMainTitle").textContent = currentBook.title;
    document.getElementById("bookAuthor").textContent = currentBook.author;
    document.getElementById("bookIsbn").textContent = currentBook.isbn || "N/A";
    document.getElementById("bookPublisher").textContent = currentBook.publisher || "N/A";
    document.getElementById("bookEdition").textContent = currentBook.edition || "N/A";
    document.getElementById("bookModule").textContent =
      currentBook.recommended_module_title
        ? `${currentBook.recommended_module_title} (${currentBook.recommended_module_code})`
        : "None";

    document.getElementById("bookCategory").textContent = currentBook.category;
    document.getElementById("bookStock").textContent =
      `${currentBook.stock_quantity} in stock`;

    document.getElementById("bookPrice").textContent =
      Number(currentBook.price || 0).toFixed(2);

    document.getElementById("bookCover").textContent = getBookInitials(currentBook.title);

    const addButton = document.getElementById("addToCartButton");

    if (Number(currentBook.stock_quantity) <= 0) {
      addButton.disabled = true;
      addButton.textContent = "Out of Stock";
    } else {
      addButton.addEventListener("click", addBookToCart);
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function addBookToCart() {
  const quantityInput = document.getElementById("quantityInput");
  const quantity = Number(quantityInput.value || 1);

  if (!Number.isInteger(quantity) || quantity < 1) {
    showMessage("Quantity must be at least 1.", "error");
    return;
  }

  try {
    await apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({
        book_id: currentBookId,
        quantity
      })
    });

    showMessage("Book added to cart.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("bookDetailsMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
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