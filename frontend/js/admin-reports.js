/**
 * admin-reports.js
 * ----------------------------------------------------
 * Handles Admin Forum Reports page.
 *
 * Features:
 * - Admin-only protection
 * - Load all reports
 * - Filter/search reports
 * - Mark report as reviewed/rejected
 * - Hide reported question
 * - Hide reported answer
 */

let allReports = [];

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  setupReportsPageEvents();
  await loadReports();
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

function setupReportsPageEvents() {
  const searchInput = document.getElementById("reportSearch");
  const statusFilter = document.getElementById("reportStatusFilter");
  const refreshButton = document.getElementById("refreshReportsButton");

  if (searchInput) {
    searchInput.addEventListener("input", renderFilteredReports);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", renderFilteredReports);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadReports);
  }
}

async function loadReports() {
  const tableBody = document.getElementById("reportsTableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="8">Loading reports...</td>
    </tr>
  `;

  try {
    const data = await apiRequest("/admin/reports");

    allReports = data.reports || [];

    renderFilteredReports();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">Could not load reports.</td>
      </tr>
    `;

    showMessage(error.message, "error");
  }
}

function renderFilteredReports() {
  const searchInput = document.getElementById("reportSearch");
  const statusFilter = document.getElementById("reportStatusFilter");

  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const status = statusFilter ? statusFilter.value : "";

  let filteredReports = [...allReports];

  if (status) {
    filteredReports = filteredReports.filter((report) => report.status === status);
  }

  if (search) {
    filteredReports = filteredReports.filter((report) => {
      return (
        String(report.target_type || "").toLowerCase().includes(search) ||
        String(report.reason || "").toLowerCase().includes(search) ||
        String(report.status || "").toLowerCase().includes(search) ||
        String(report.reporter_name || "").toLowerCase().includes(search) ||
        String(report.reporter_email || "").toLowerCase().includes(search) ||
        String(report.target_preview || "").toLowerCase().includes(search)
      );
    });
  }

  renderReports(filteredReports);
}

function renderReports(reports) {
  const tableBody = document.getElementById("reportsTableBody");

  if (!reports.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">No reports found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = reports.map(createReportRow).join("");

  document.querySelectorAll("[data-report-status]").forEach((select) => {
    select.addEventListener("change", async () => {
      const reportId = select.getAttribute("data-report-status");
      const status = select.value;

      await updateReportStatus(reportId, status);
    });
  });

  document.querySelectorAll("[data-hide-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      const questionId = button.getAttribute("data-hide-question");
      await updateQuestionStatus(questionId, "hidden");
    });
  });

  document.querySelectorAll("[data-lock-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      const questionId = button.getAttribute("data-lock-question");
      await updateQuestionStatus(questionId, "locked");
    });
  });

  document.querySelectorAll("[data-open-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      const questionId = button.getAttribute("data-open-question");
      await updateQuestionStatus(questionId, "open");
    });
  });

  document.querySelectorAll("[data-hide-answer]").forEach((button) => {
    button.addEventListener("click", async () => {
      const answerId = button.getAttribute("data-hide-answer");
      await updateAnswerStatus(answerId, "hidden");
    });
  });

  document.querySelectorAll("[data-show-answer]").forEach((button) => {
    button.addEventListener("click", async () => {
      const answerId = button.getAttribute("data-show-answer");
      await updateAnswerStatus(answerId, "visible");
    });
  });
}

function createReportRow(report) {
  const preview = shortenText(report.target_preview || "No preview available.", 120);
  const reason = shortenText(report.reason || "No reason provided.", 90);

  return `
    <tr>
      <td>
        <span class="admin-role-badge">
          ${escapeHtml(report.target_type)}
        </span>
      </td>

      <td>
        ${escapeHtml(preview)}
      </td>

      <td>
        ${escapeHtml(reason)}
      </td>

      <td>
        <strong>${escapeHtml(report.reporter_name || "Unknown")}</strong>
        <br />
        <span style="color: var(--muted);">
          ${escapeHtml(report.reporter_email || "N/A")}
        </span>
      </td>

      <td>
        <span class="admin-role-badge">
          ${escapeHtml(report.status)}
        </span>
      </td>

      <td>
        ${formatDate(report.created_at)}
      </td>

      <td>
        <select data-report-status="${report.id}">
          <option value="pending" ${report.status === "pending" ? "selected" : ""}>pending</option>
          <option value="reviewed" ${report.status === "reviewed" ? "selected" : ""}>reviewed</option>
          <option value="rejected" ${report.status === "rejected" ? "selected" : ""}>rejected</option>
        </select>
      </td>

      <td>
        ${createModerationButtons(report)}
      </td>
    </tr>
  `;
}

function createModerationButtons(report) {
  if (report.target_type === "question") {
    return `
      <div class="module-actions">
        <button class="btn btn-secondary" data-hide-question="${report.target_id}">
          Hide
        </button>

        <button class="btn btn-secondary" data-lock-question="${report.target_id}">
          Lock
        </button>

        <button class="btn btn-secondary" data-open-question="${report.target_id}">
          Reopen
        </button>
      </div>
    `;
  }

  if (report.target_type === "answer") {
    return `
      <div class="module-actions">
        <button class="btn btn-secondary" data-hide-answer="${report.target_id}">
          Hide
        </button>

        <button class="btn btn-secondary" data-show-answer="${report.target_id}">
          Show
        </button>
      </div>
    `;
  }

  return "N/A";
}

async function updateReportStatus(reportId, status) {
  const note = prompt("Add an admin note for this report:", "Reviewed by admin.");

  try {
    await apiRequest(`/admin/reports/${reportId}`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        admin_note: note || ""
      })
    });

    showMessage("Report status updated.", "success");
    await loadReports();
  } catch (error) {
    showMessage(error.message, "error");
    await loadReports();
  }
}

async function updateQuestionStatus(questionId, status) {
  const confirmed = confirm(`Are you sure you want to set this question to "${status}"?`);

  if (!confirmed) return;

  try {
    await apiRequest(`/admin/forum/questions/${questionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    showMessage(`Question marked as ${status}.`, "success");
    await loadReports();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function updateAnswerStatus(answerId, status) {
  const confirmed = confirm(`Are you sure you want to set this answer to "${status}"?`);

  if (!confirmed) return;

  try {
    await apiRequest(`/admin/forum/answers/${answerId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    showMessage(`Answer marked as ${status}.`, "success");
    await loadReports();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminReportsMessage");

  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message-box";
  }, 4000);
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