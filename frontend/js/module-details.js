/**
 * module-details.js
 * ----------------------------------------------------
 * Handles module detail page:
 * - Module information
 * - Lessons
 * - Resources
 * - Mark complete/uncomplete
 */

let currentModuleId = null;

document.addEventListener("DOMContentLoaded", async () => {
  protectModuleDetailPage();
  setupLogoutButton();

  currentModuleId = getModuleIdFromUrl();

  if (!currentModuleId) {
    showDetailMessage("Module ID is missing from the URL.", "error");
    return;
  }

  await loadModulePage();
});

function protectModuleDetailPage() {
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

function getModuleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadModulePage() {
  await Promise.all([
    loadModuleDetails(),
    loadLessons(),
    loadResources()
  ]);
}

async function loadModuleDetails() {
  try {
    const data = await apiRequest(`/modules/${currentModuleId}`);
    const module = data.module;

    const progress = Number(module.progress_percentage || 0);

    document.getElementById("moduleTitle").textContent = module.title;
    document.getElementById("moduleCode").textContent = module.module_code;
    document.getElementById("moduleDescription").textContent = module.description;
    document.getElementById("moduleCategory").textContent = module.category_name || "General";
    document.getElementById("moduleInstructor").textContent = module.instructor_name;
    document.getElementById("moduleDifficulty").textContent = module.difficulty_level;
    document.getElementById("moduleLessons").textContent = module.total_lessons;
    document.getElementById("moduleCompleted").textContent = module.completed_lessons;
    document.getElementById("moduleProgress").textContent = `${progress}%`;
    document.getElementById("moduleProgressFill").style.width = `${progress}%`;

    const enrollButton = document.getElementById("enrollButton");

    if (module.is_enrolled) {
      enrollButton.textContent = "Module Started";
      enrollButton.disabled = true;
    } else {
      enrollButton.textContent = "Start Module";
      enrollButton.disabled = false;

      enrollButton.onclick = async () => {
        await enrollInCurrentModule();
      };
    }
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function enrollInCurrentModule() {
  try {
    await apiRequest(`/modules/${currentModuleId}/enroll`, {
      method: "POST"
    });

    showDetailMessage("Module started successfully.", "success");
    await loadModulePage();
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function loadLessons() {
  const lessonList = document.getElementById("lessonList");

  if (!lessonList) return;

  lessonList.innerHTML = `<div class="empty-state">Loading lessons...</div>`;

  try {
    const data = await apiRequest(`/modules/${currentModuleId}/lessons`);

    if (!data.lessons || data.lessons.length === 0) {
      lessonList.innerHTML = `
        <div class="empty-state">No lessons have been added for this module yet.</div>
      `;
      return;
    }

    lessonList.innerHTML = data.lessons.map(createLessonItem).join("");

    document.querySelectorAll("[data-complete-lesson]").forEach((button) => {
      button.addEventListener("click", async () => {
        const lessonId = button.getAttribute("data-complete-lesson");
        await completeLesson(lessonId);
      });
    });

    document.querySelectorAll("[data-uncomplete-lesson]").forEach((button) => {
      button.addEventListener("click", async () => {
        const lessonId = button.getAttribute("data-uncomplete-lesson");
        await uncompleteLesson(lessonId);
      });
    });
  } catch (error) {
    lessonList.innerHTML = `
      <div class="empty-state">Could not load lessons.</div>
    `;
    showDetailMessage(error.message, "error");
  }
}

function createLessonItem(lesson) {
  const completed = lesson.is_completed === true;

  return `
    <article class="lesson-item">
      <div class="lesson-top">
        <div>
          <h3 class="lesson-title">
            Lesson ${lesson.lesson_order}: ${escapeHtml(lesson.title)}
          </h3>
          <p>${escapeHtml(lesson.description || "No description added.")}</p>
          <p>
            <strong>Duration:</strong> ${lesson.duration_minutes || 0} minutes
          </p>
        </div>

        <span class="badge ${completed ? "badge-success" : "badge-muted"}">
          ${completed ? "Completed" : "Not completed"}
        </span>
      </div>

      <div class="module-actions" style="margin-top: 14px;">
        ${
          completed
            ? `<button class="btn btn-secondary" data-uncomplete-lesson="${lesson.id}">
                Mark Incomplete
              </button>`
            : `<button class="btn btn-primary" data-complete-lesson="${lesson.id}">
                Mark Complete
              </button>`
        }
      </div>
    </article>
  `;
}

async function completeLesson(lessonId) {
  try {
    await apiRequest("/progress/complete-lesson", {
      method: "POST",
      body: JSON.stringify({
        module_id: currentModuleId,
        lesson_id: lessonId
      })
    });

    showDetailMessage("Lesson marked as completed.", "success");
    await loadModulePage();
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function uncompleteLesson(lessonId) {
  try {
    await apiRequest("/progress/uncomplete-lesson", {
      method: "POST",
      body: JSON.stringify({
        module_id: currentModuleId,
        lesson_id: lessonId
      })
    });

    showDetailMessage("Lesson marked as incomplete.", "success");
    await loadModulePage();
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function loadResources() {
  const resourceList = document.getElementById("resourceList");

  if (!resourceList) return;

  resourceList.innerHTML = `<div class="empty-state">Loading resources...</div>`;

  try {
    const data = await apiRequest(`/modules/${currentModuleId}/resources`);

    if (!data.resources || data.resources.length === 0) {
      resourceList.innerHTML = `
        <div class="empty-state">No resources have been added yet.</div>
      `;
      return;
    }

    resourceList.innerHTML = data.resources.map(createResourceItem).join("");
  } catch (error) {
    resourceList.innerHTML = `
      <div class="empty-state">Could not load resources.</div>
    `;
    showDetailMessage(error.message, "error");
  }
}

function createResourceItem(resource) {
  const url = resource.external_url || resource.file_url;

  return `
    <article class="resource-item">
      <div class="module-meta">
        <span class="badge">${escapeHtml(resource.resource_type)}</span>
        ${
          resource.lesson_title
            ? `<span class="badge badge-muted">Lesson ${resource.lesson_order}</span>`
            : ""
        }
      </div>

      <h3>${escapeHtml(resource.title)}</h3>
      <p>${escapeHtml(resource.description || "No description added.")}</p>

      ${
        url
          ? `<div class="module-actions" style="margin-top: 14px;">
              <a class="btn btn-secondary" href="${url}" target="_blank" rel="noopener">
                Open Resource
              </a>
            </div>`
          : `<p style="margin-top: 10px;">
              This is a text resource. Details are shown in the description.
            </p>`
      }
    </article>
  `;
}

function showDetailMessage(message, type = "success") {
  const messageBox = document.getElementById("detailMessage");

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