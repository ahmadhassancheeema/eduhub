/**
 * learning.js
 * ----------------------------------------------------
 * Handles the Learning Wing module list page.
 */

document.addEventListener("DOMContentLoaded", () => {
  protectLearningPage();
  setupLogoutButton();
  setupLearningPage();
});

function protectLearningPage() {
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

async function setupLearningPage() {
  const searchInput = document.getElementById("moduleSearch");
  const categorySelect = document.getElementById("categoryFilter");
  const refreshButton = document.getElementById("refreshModulesButton");

  await loadCategories();
  await loadModules();

  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadModules, 400));
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", loadModules);
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", loadModules);
  }
}

async function loadCategories() {
  const categorySelect = document.getElementById("categoryFilter");

  if (!categorySelect) return;

  try {
    const data = await apiRequest("/modules/categories");

    categorySelect.innerHTML = `<option value="">All categories</option>`;

    data.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    showLearningMessage(error.message, "error");
  }
}

async function loadModules() {
  const modulesContainer = document.getElementById("modulesContainer");
  const searchInput = document.getElementById("moduleSearch");
  const categorySelect = document.getElementById("categoryFilter");

  if (!modulesContainer) return;

  modulesContainer.innerHTML = `<div class="empty-state">Loading modules...</div>`;

  const params = new URLSearchParams();

  if (searchInput && searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  if (categorySelect && categorySelect.value) {
    params.append("category", categorySelect.value);
  }

  const endpoint = params.toString()
    ? `/modules?${params.toString()}`
    : "/modules";

  try {
    const data = await apiRequest(endpoint);

    if (!data.modules || data.modules.length === 0) {
      modulesContainer.innerHTML = `
        <div class="empty-state">
          No modules found. Try changing your search or filter.
        </div>
      `;
      return;
    }

    modulesContainer.innerHTML = data.modules.map(createModuleCard).join("");

    document.querySelectorAll("[data-enroll-module]").forEach((button) => {
      button.addEventListener("click", async () => {
        const moduleId = button.getAttribute("data-enroll-module");
        await enrollModule(moduleId);
      });
    });
  } catch (error) {
    modulesContainer.innerHTML = `
      <div class="empty-state">
        Could not load modules.
      </div>
    `;

    showLearningMessage(error.message, "error");
  }
}

function createModuleCard(module) {
  const progress = Number(module.progress_percentage || 0);
  const enrolledText = module.is_enrolled ? "Started" : "Not started";
  const enrolledClass = module.is_enrolled ? "badge-success" : "badge-muted";

  return `
    <article class="module-card">
      <div class="module-meta">
        <span class="badge">${escapeHtml(module.category_name || "General")}</span>
        <span class="badge ${enrolledClass}">${enrolledText}</span>
        <span class="badge badge-muted">${escapeHtml(module.difficulty_level)}</span>
      </div>

      <h2>${escapeHtml(module.title)}</h2>

      <p>${escapeHtml(module.description)}</p>

      <div>
        <strong>Code:</strong> ${escapeHtml(module.module_code)}
        <br />
        <strong>Instructor:</strong> ${escapeHtml(module.instructor_name)}
        <br />
        <strong>Lessons:</strong> ${module.total_lessons}
      </div>

      <div class="module-footer">
        <div class="small-progress-text">
          <span>Progress</span>
          <span>${progress}%</span>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>

        <div class="module-actions">
          ${
            module.is_enrolled
              ? ""
              : `<button class="btn btn-secondary" data-enroll-module="${module.id}">Start Module</button>`
          }

          <a class="btn btn-primary" href="module-details.html?id=${module.id}">
            Open Module
          </a>
        </div>
      </div>
    </article>
  `;
}

async function enrollModule(moduleId) {
  try {
    await apiRequest(`/modules/${moduleId}/enroll`, {
      method: "POST"
    });

    showLearningMessage("Module started successfully.", "success");
    await loadModules();
  } catch (error) {
    showLearningMessage(error.message, "error");
  }
}

function showLearningMessage(message, type = "success") {
  const messageBox = document.getElementById("learningMessage");

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

function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}