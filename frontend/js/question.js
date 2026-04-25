/**
 * question.js
 * ----------------------------------------------------
 * Handles question details page:
 * - Display question
 * - Display answers
 * - Post answer
 * - Vote
 * - Report
 */

let currentQuestionId = null;

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupLogoutButton();

  currentQuestionId = getQuestionIdFromUrl();

  if (!currentQuestionId) {
    showMessage("Question ID is missing from the URL.", "error");
    return;
  }

  setupAnswerForm();
  setupQuestionButtons();
  await loadQuestion();
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

function getQuestionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function setupQuestionButtons() {
  document.getElementById("upvoteQuestionButton").addEventListener("click", async () => {
    await vote("question", currentQuestionId, "upvote");
  });

  document.getElementById("downvoteQuestionButton").addEventListener("click", async () => {
    await vote("question", currentQuestionId, "downvote");
  });

  document.getElementById("reportQuestionButton").addEventListener("click", async () => {
    await reportContent("question", currentQuestionId);
  });
}

function setupAnswerForm() {
  const form = document.getElementById("answerForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const body = document.getElementById("answerBody").value.trim();

    if (!body || body.length < 5) {
      showMessage("Answer must be at least 5 characters.", "error");
      return;
    }

    try {
      await apiRequest(`/forum/questions/${currentQuestionId}/answers`, {
        method: "POST",
        body: JSON.stringify({ body })
      });

      document.getElementById("answerBody").value = "";

      showMessage("Answer posted successfully.", "success");
      await loadQuestion();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

async function loadQuestion() {
  try {
    const data = await apiRequest(`/forum/questions/${currentQuestionId}`);

    renderQuestion(data.question);
    renderAnswers(data.answers || []);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderQuestion(question) {
  document.getElementById("questionTitle").textContent = question.title;
  document.getElementById("questionPreview").textContent = shortenText(question.body, 160);
  document.getElementById("questionCategory").textContent = question.category_name || "General";
  document.getElementById("questionAuthor").textContent = `By ${question.author_name}`;
  document.getElementById("questionDate").textContent = formatDate(question.created_at);
  document.getElementById("questionViews").textContent = question.view_count || 0;
  document.getElementById("questionScore").textContent = question.vote_score || 0;
  document.getElementById("questionBody").textContent = question.body;

  const tagsContainer = document.getElementById("questionTags");
  const tags = normalizeTags(question.tags);

  tagsContainer.innerHTML = tags
    .map((tag) => `<span class="badge badge-muted">#${escapeHtml(tag)}</span>`)
    .join("");
}

function renderAnswers(answers) {
  const container = document.getElementById("answersContainer");

  if (!answers.length) {
    container.innerHTML = `
      <div class="empty-state">
        No answers yet. Be the first to answer.
      </div>
    `;
    return;
  }

  container.innerHTML = answers.map(createAnswerCard).join("");

  document.querySelectorAll("[data-vote-answer]").forEach((button) => {
    button.addEventListener("click", async () => {
      await vote(
        "answer",
        button.getAttribute("data-answer-id"),
        button.getAttribute("data-vote-answer")
      );
    });
  });

  document.querySelectorAll("[data-report-answer]").forEach((button) => {
    button.addEventListener("click", async () => {
      await reportContent("answer", button.getAttribute("data-report-answer"));
    });
  });
}

function createAnswerCard(answer) {
  return `
    <article class="answer-card">
      <div class="answer-meta">
        <span class="badge badge-muted">By ${escapeHtml(answer.author_name)}</span>
        <span class="badge badge-muted">${formatDate(answer.created_at)}</span>
        <span class="badge badge-success">Score: ${answer.vote_score || 0}</span>
        ${
          answer.is_accepted
            ? `<span class="badge badge-success">Accepted</span>`
            : ""
        }
      </div>

      <div class="question-body">${escapeHtml(answer.body)}</div>

      <div class="answer-actions">
        <button
          class="btn btn-secondary"
          data-answer-id="${answer.id}"
          data-vote-answer="upvote"
        >
          Upvote
        </button>

        <button
          class="btn btn-secondary"
          data-answer-id="${answer.id}"
          data-vote-answer="downvote"
        >
          Downvote
        </button>

        <button
          class="btn btn-secondary"
          data-report-answer="${answer.id}"
        >
          Report
        </button>
      </div>
    </article>
  `;
}

async function vote(targetType, targetId, voteType) {
  try {
    await apiRequest("/forum/vote", {
      method: "POST",
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType
      })
    });

    showMessage("Vote saved.", "success");
    await loadQuestion();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function reportContent(targetType, targetId) {
  const reason = prompt(`Why are you reporting this ${targetType}?`);

  if (!reason || reason.trim().length < 5) {
    showMessage("Report reason must be at least 5 characters.", "error");
    return;
  }

  try {
    await apiRequest("/forum/report", {
      method: "POST",
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        reason: reason.trim()
      })
    });

    showMessage("Report submitted.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("questionMessage");

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

function shortenText(text, maxLength) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
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