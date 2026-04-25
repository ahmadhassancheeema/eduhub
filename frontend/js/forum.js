/**
 * forum.js
 * ----------------------------------------------------
 * Handles forum question listing, filters, votes, and reports.
 */

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();
  await setupForumPage();
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

async function setupForumPage() {
  const searchInput = document.getElementById("forumSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const tagFilter = document.getElementById("tagFilter");
  const refreshButton = document.getElementById("refreshQuestionsButton");

  await loadCategories();
  await loadTags();
  await loadQuestions();

  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadQuestions, 400));
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", loadQuestions);
  }

  if (tagFilter) {
    tagFilter.addEventListener("change", loadQuestions);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadQuestions);
  }
}

async function loadCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  try {
    const data = await apiRequest("/forum/categories");

    categoryFilter.innerHTML = `<option value="">All categories</option>`;

    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadTags() {
  const tagFilter = document.getElementById("tagFilter");

  try {
    const data = await apiRequest("/forum/tags");

    tagFilter.innerHTML = `<option value="">All tags</option>`;

    data.tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag.name;
      option.textContent = tag.name;
      tagFilter.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function loadQuestions() {
  const container = document.getElementById("questionsContainer");
  const searchInput = document.getElementById("forumSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const tagFilter = document.getElementById("tagFilter");

  container.innerHTML = `<div class="empty-state">Loading questions...</div>`;

  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  if (categoryFilter && categoryFilter.value) {
    params.append("category", categoryFilter.value);
  }

  if (tagFilter && tagFilter.value) {
    params.append("tag", tagFilter.value);
  }

  const endpoint = params.toString()
    ? `/forum/questions?${params.toString()}`
    : "/forum/questions";

  try {
    const data = await apiRequest(endpoint);

    if (!data.questions || data.questions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          No questions found. Be the first to ask one.
        </div>
      `;
      return;
    }

    container.innerHTML = data.questions.map(createQuestionCard).join("");

    document.querySelectorAll("[data-vote-question]").forEach((button) => {
      button.addEventListener("click", async () => {
        await voteQuestion(
          button.getAttribute("data-question-id"),
          button.getAttribute("data-vote-question")
        );
      });
    });

    document.querySelectorAll("[data-report-question]").forEach((button) => {
      button.addEventListener("click", async () => {
        await reportQuestion(button.getAttribute("data-report-question"));
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Could not load questions.</div>`;
    showMessage(error.message, "error");
  }
}

function createQuestionCard(question) {
  const tags = normalizeTags(question.tags);

  return `
    <article class="question-card">
      <div class="question-meta">
        <span class="badge">${escapeHtml(question.category_name || "General")}</span>
        <span class="badge badge-muted">By ${escapeHtml(question.author_name)}</span>
        <span class="badge badge-muted">${formatDate(question.created_at)}</span>
        <span class="badge badge-success">Score: ${question.vote_score || 0}</span>
      </div>

      <h2>${escapeHtml(question.title)}</h2>

      <p>${escapeHtml(shortenText(question.body, 180))}</p>

      <div class="tag-list">
        ${tags.map((tag) => `<span class="badge badge-muted">#${escapeHtml(tag)}</span>`).join("")}
      </div>

      <div class="question-meta">
        <span>Answers: ${question.answer_count || 0}</span>
        <span>Views: ${question.view_count || 0}</span>
      </div>

      <div class="question-actions">
        <a class="btn btn-primary" href="question.html?id=${question.id}">
          Open Question
        </a>

        <button
          class="btn btn-secondary"
          data-question-id="${question.id}"
          data-vote-question="upvote"
        >
          Upvote
        </button>

        <button
          class="btn btn-secondary"
          data-question-id="${question.id}"
          data-vote-question="downvote"
        >
          Downvote
        </button>

        <button
          class="btn btn-secondary"
          data-report-question="${question.id}"
        >
          Report
        </button>
      </div>
    </article>
  `;
}

async function voteQuestion(questionId, voteType) {
  try {
    await apiRequest("/forum/vote", {
      method: "POST",
      body: JSON.stringify({
        target_type: "question",
        target_id: questionId,
        vote_type: voteType
      })
    });

    showMessage("Vote saved.", "success");
    await loadQuestions();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function reportQuestion(questionId) {
  const reason = prompt("Why are you reporting this question?");

  if (!reason || reason.trim().length < 5) {
    showMessage("Report reason must be at least 5 characters.", "error");
    return;
  }

  try {
    await apiRequest("/forum/report", {
      method: "POST",
      body: JSON.stringify({
        target_type: "question",
        target_id: questionId,
        reason: reason.trim()
      })
    });

    showMessage("Report submitted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("forumMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
}

function normalizeTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .replace(/[{}"]/g, "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function debounce(callback, delay) {
  let timeoutId;

  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

function shortenText(text, maxLength) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString();
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