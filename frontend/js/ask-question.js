/**
 * ask-question.js
 * ----------------------------------------------------
 * Handles ask question page.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();
  await loadCategories();
  setupAskQuestionForm();
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

async function loadCategories() {
  const categorySelect = document.getElementById("questionCategory");

  try {
    const data = await apiRequest("/forum/categories");

    categorySelect.innerHTML = `<option value="">Select category</option>`;

    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function setupAskQuestionForm() {
  const form = document.getElementById("askQuestionForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("questionTitle").value.trim();
    const body = document.getElementById("questionBody").value.trim();
    const categoryId = document.getElementById("questionCategory").value;
    const tagsText = document.getElementById("questionTags").value.trim();

    const tags = tagsText
      ? tagsText.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)
      : [];

    try {
      const data = await apiRequest("/forum/questions", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          category_id: categoryId,
          tags
        })
      });

      showMessage("Question posted successfully.", "success");

      setTimeout(() => {
        window.location.href = `question.html?id=${data.question.id}`;
      }, 700);
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("askQuestionMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
}