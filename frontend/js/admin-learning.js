/**
 * admin-learning.js
 * ----------------------------------------------------
 * Handles Admin Learning Content Management page.
 */

let allCategories = [];
let allModules = [];
let currentLessons = [];
let currentResources = [];
let selectedModule = null;

document.addEventListener("DOMContentLoaded", async () => {
  await protectAdminPage();
  setupLogoutButton();
  setupEvents();

  await loadCategories();
  await loadModules();
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

function setupEvents() {
  document.getElementById("categoryForm").addEventListener("submit", createCategory);
  document.getElementById("moduleForm").addEventListener("submit", saveModule);
  document.getElementById("lessonForm").addEventListener("submit", saveLesson);
  document.getElementById("resourceForm").addEventListener("submit", saveResource);

  document.getElementById("resetModuleFormButton").addEventListener("click", resetModuleForm);
  document.getElementById("resetLessonFormButton").addEventListener("click", resetLessonForm);
  document.getElementById("resetResourceFormButton").addEventListener("click", resetResourceForm);

  document.getElementById("moduleSearch").addEventListener("input", debounce(loadModules, 400));
  document.getElementById("moduleStatusFilter").addEventListener("change", loadModules);
  document.getElementById("refreshModulesButton").addEventListener("click", loadModules);

  document.getElementById("reloadSelectedModuleButton").addEventListener("click", async () => {
    if (selectedModule) {
      await loadSelectedModuleContent(selectedModule.id);
    }
  });
}

/* -----------------------------
   Categories
----------------------------- */

async function loadCategories() {
  try {
    const data = await apiRequest("/admin/learning/categories");
    allCategories = data.categories || [];

    const moduleCategory = document.getElementById("moduleCategory");
    moduleCategory.innerHTML = `<option value="">No category</option>`;

    allCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      moduleCategory.appendChild(option);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function createCategory(event) {
  event.preventDefault();

  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  try {
    await apiRequest("/admin/learning/categories", {
      method: "POST",
      body: JSON.stringify({
        name,
        description
      })
    });

    document.getElementById("categoryForm").reset();
    showMessage("Category added successfully.", "success");
    await loadCategories();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

/* -----------------------------
   Modules
----------------------------- */

async function loadModules() {
  const tableBody = document.getElementById("modulesTableBody");
  const search = document.getElementById("moduleSearch").value.trim();
  const status = document.getElementById("moduleStatusFilter").value;

  tableBody.innerHTML = `
    <tr>
      <td colspan="7">Loading modules...</td>
    </tr>
  `;

  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const endpoint = params.toString()
    ? `/admin/learning/modules?${params.toString()}`
    : "/admin/learning/modules";

  try {
    const data = await apiRequest(endpoint);
    allModules = data.modules || [];
    renderModules(allModules);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">Could not load modules.</td>
      </tr>
    `;
    showMessage(error.message, "error");
  }
}

function renderModules(modules) {
  const tableBody = document.getElementById("modulesTableBody");

  if (!modules.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No modules found.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = modules.map(createModuleRow).join("");

  document.querySelectorAll("[data-edit-module]").forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.getAttribute("data-edit-module");
      const module = allModules.find((item) => item.id === moduleId);

      if (module) fillModuleForm(module);
    });
  });

  document.querySelectorAll("[data-toggle-module]").forEach((button) => {
    button.addEventListener("click", async () => {
      const moduleId = button.getAttribute("data-toggle-module");
      const newStatus = button.getAttribute("data-new-status") === "true";

      await updateModuleStatus(moduleId, newStatus);
    });
  });

  document.querySelectorAll("[data-manage-module]").forEach((button) => {
    button.addEventListener("click", async () => {
      const moduleId = button.getAttribute("data-manage-module");
      await selectModule(moduleId);
    });
  });
}

function createModuleRow(module) {
  const isPublished = module.is_published === true;
  const statusText = isPublished ? "Published" : "Unpublished";
  const statusClass = isPublished ? "admin-status-active" : "admin-status-inactive";
  const actionText = isPublished ? "Unpublish" : "Publish";
  const newStatus = isPublished ? "false" : "true";

  return `
    <tr>
      <td>
        <strong>${escapeHtml(module.title)}</strong>
        <br />
        <span style="color: var(--muted);">${escapeHtml(module.module_code)}</span>
      </td>

      <td>${escapeHtml(module.category_name || "None")}</td>

      <td>${escapeHtml(module.instructor_name || "N/A")}</td>

      <td>${module.lesson_count || 0}</td>

      <td>${module.resource_count || 0}</td>

      <td>
        <span class="${statusClass}">
          ${statusText}
        </span>
      </td>

      <td>
        <div class="module-actions">
          <button class="btn btn-secondary" data-manage-module="${module.id}">
            Manage Content
          </button>

          <button class="btn btn-secondary" data-edit-module="${module.id}">
            Edit
          </button>

          <button
            class="btn btn-secondary"
            data-toggle-module="${module.id}"
            data-new-status="${newStatus}"
          >
            ${actionText}
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function saveModule(event) {
  event.preventDefault();

  const moduleId = document.getElementById("moduleId").value;

  const payload = {
    title: document.getElementById("moduleTitle").value.trim(),
    module_code: document.getElementById("moduleCode").value.trim(),
    description: document.getElementById("moduleDescription").value.trim(),
    category_id: document.getElementById("moduleCategory").value || null,
    instructor_name: document.getElementById("moduleInstructor").value.trim(),
    difficulty_level: document.getElementById("moduleDifficulty").value,
    estimated_hours: Number(document.getElementById("moduleHours").value || 0),
    thumbnail_url: document.getElementById("moduleThumbnail").value.trim() || null,
    is_published: document.getElementById("modulePublished").checked
  };

  try {
    if (moduleId) {
      await apiRequest(`/admin/learning/modules/${moduleId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      showMessage("Module updated successfully.", "success");
    } else {
      await apiRequest("/admin/learning/modules", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showMessage("Module added successfully.", "success");
    }

    resetModuleForm();
    await loadModules();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function fillModuleForm(module) {
  document.getElementById("moduleFormTitle").textContent = "Edit Module";
  document.getElementById("saveModuleButton").textContent = "Update Module";

  document.getElementById("moduleId").value = module.id;
  document.getElementById("moduleTitle").value = module.title || "";
  document.getElementById("moduleCode").value = module.module_code || "";
  document.getElementById("moduleDescription").value = module.description || "";
  document.getElementById("moduleCategory").value = module.category_id || "";
  document.getElementById("moduleInstructor").value = module.instructor_name || "";
  document.getElementById("moduleDifficulty").value = module.difficulty_level || "beginner";
  document.getElementById("moduleHours").value = module.estimated_hours || 0;
  document.getElementById("moduleThumbnail").value = module.thumbnail_url || "";
  document.getElementById("modulePublished").checked = module.is_published === true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function resetModuleForm() {
  document.getElementById("moduleForm").reset();
  document.getElementById("moduleId").value = "";
  document.getElementById("moduleFormTitle").textContent = "Add New Module";
  document.getElementById("saveModuleButton").textContent = "Add Module";
  document.getElementById("modulePublished").checked = true;
  document.getElementById("moduleDifficulty").value = "beginner";
  document.getElementById("moduleCategory").value = "";
}

async function updateModuleStatus(moduleId, isPublished) {
  try {
    await apiRequest(`/admin/learning/modules/${moduleId}/status`, {
      method: "PUT",
      body: JSON.stringify({
        is_published: isPublished
      })
    });

    showMessage("Module status updated.", "success");
    await loadModules();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function selectModule(moduleId) {
  selectedModule = allModules.find((module) => module.id === moduleId);

  if (!selectedModule) return;

  document.getElementById("selectedModuleTitle").textContent =
    `${selectedModule.title} (${selectedModule.module_code})`;

  document.getElementById("selectedModuleMeta").textContent =
    `${selectedModule.lesson_count || 0} lessons · ${selectedModule.resource_count || 0} resources`;

  document.getElementById("reloadSelectedModuleButton").disabled = false;

  resetLessonForm();
  resetResourceForm();

  await loadSelectedModuleContent(moduleId);
}

async function loadSelectedModuleContent(moduleId) {
  await Promise.all([
    loadLessons(moduleId),
    loadResources(moduleId)
  ]);
}

/* -----------------------------
   Lessons
----------------------------- */

async function loadLessons(moduleId) {
  const tableBody = document.getElementById("lessonsTableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="4">Loading lessons...</td>
    </tr>
  `;

  try {
    const data = await apiRequest(`/admin/learning/modules/${moduleId}/lessons`);
    currentLessons = data.lessons || [];

    renderLessons(currentLessons);
    populateResourceLessonSelect();
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4">Could not load lessons.</td>
      </tr>
    `;
    showMessage(error.message, "error");
  }
}

function renderLessons(lessons) {
  const tableBody = document.getElementById("lessonsTableBody");

  if (!lessons.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4">No lessons added yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = lessons.map(createLessonRow).join("");

  document.querySelectorAll("[data-edit-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const lessonId = button.getAttribute("data-edit-lesson");
      const lesson = currentLessons.find((item) => item.id === lessonId);

      if (lesson) fillLessonForm(lesson);
    });
  });

  document.querySelectorAll("[data-delete-lesson]").forEach((button) => {
    button.addEventListener("click", async () => {
      const lessonId = button.getAttribute("data-delete-lesson");
      await deleteLesson(lessonId);
    });
  });
}

function createLessonRow(lesson) {
  return `
    <tr>
      <td>${lesson.lesson_order}</td>

      <td>
        <strong>${escapeHtml(lesson.title)}</strong>
        <br />
        <span style="color: var(--muted);">
          ${escapeHtml(lesson.description || "No description")}
        </span>
      </td>

      <td>${lesson.duration_minutes || 0} minutes</td>

      <td>
        <div class="module-actions">
          <button class="btn btn-secondary" data-edit-lesson="${lesson.id}">
            Edit
          </button>

          <button class="btn btn-secondary" data-delete-lesson="${lesson.id}">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function saveLesson(event) {
  event.preventDefault();

  if (!selectedModule) {
    showMessage("Select a module first.", "error");
    return;
  }

  const lessonId = document.getElementById("lessonId").value;

  const payload = {
    module_id: selectedModule.id,
    title: document.getElementById("lessonTitle").value.trim(),
    description: document.getElementById("lessonDescription").value.trim() || null,
    lesson_order: Number(document.getElementById("lessonOrder").value),
    duration_minutes: Number(document.getElementById("lessonDuration").value || 0)
  };

  try {
    if (lessonId) {
      await apiRequest(`/admin/learning/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      showMessage("Lesson updated successfully.", "success");
    } else {
      await apiRequest("/admin/learning/lessons", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showMessage("Lesson added successfully.", "success");
    }

    resetLessonForm();
    await loadSelectedModuleContent(selectedModule.id);
    await loadModules();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function fillLessonForm(lesson) {
  document.getElementById("lessonFormTitle").textContent = "Edit Lesson";
  document.getElementById("saveLessonButton").textContent = "Update Lesson";

  document.getElementById("lessonId").value = lesson.id;
  document.getElementById("lessonTitle").value = lesson.title || "";
  document.getElementById("lessonDescription").value = lesson.description || "";
  document.getElementById("lessonOrder").value = lesson.lesson_order || 1;
  document.getElementById("lessonDuration").value = lesson.duration_minutes || 0;
}

function resetLessonForm() {
  document.getElementById("lessonForm").reset();
  document.getElementById("lessonId").value = "";
  document.getElementById("lessonFormTitle").textContent = "Add Lesson";
  document.getElementById("saveLessonButton").textContent = "Add Lesson";
}

async function deleteLesson(lessonId) {
  const confirmed = confirm("Delete this lesson? This may also affect attached resources/progress.");

  if (!confirmed) return;

  try {
    await apiRequest(`/admin/learning/lessons/${lessonId}`, {
      method: "DELETE"
    });

    showMessage("Lesson deleted successfully.", "success");
    resetLessonForm();

    if (selectedModule) {
      await loadSelectedModuleContent(selectedModule.id);
      await loadModules();
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

/* -----------------------------
   Resources
----------------------------- */

async function loadResources(moduleId) {
  const tableBody = document.getElementById("resourcesTableBody");

  tableBody.innerHTML = `
    <tr>
      <td colspan="5">Loading resources...</td>
    </tr>
  `;

  try {
    const data = await apiRequest(`/admin/learning/modules/${moduleId}/resources`);
    currentResources = data.resources || [];

    renderResources(currentResources);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">Could not load resources.</td>
      </tr>
    `;
    showMessage(error.message, "error");
  }
}

function populateResourceLessonSelect() {
  const resourceLesson = document.getElementById("resourceLesson");

  resourceLesson.innerHTML = `<option value="">No lesson</option>`;

  currentLessons.forEach((lesson) => {
    const option = document.createElement("option");
    option.value = lesson.id;
    option.textContent = `Lesson ${lesson.lesson_order}: ${lesson.title}`;
    resourceLesson.appendChild(option);
  });
}

function renderResources(resources) {
  const tableBody = document.getElementById("resourcesTableBody");

  if (!resources.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No resources added yet.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = resources.map(createResourceRow).join("");

  document.querySelectorAll("[data-edit-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      const resourceId = button.getAttribute("data-edit-resource");
      const resource = currentResources.find((item) => item.id === resourceId);

      if (resource) fillResourceForm(resource);
    });
  });

  document.querySelectorAll("[data-delete-resource]").forEach((button) => {
    button.addEventListener("click", async () => {
      const resourceId = button.getAttribute("data-delete-resource");
      await deleteResource(resourceId);
    });
  });
}

function createResourceRow(resource) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(resource.title)}</strong>
        <br />
        <span style="color: var(--muted);">
          ${escapeHtml(resource.description || "No description")}
        </span>
      </td>

      <td>
        <span class="admin-role-badge">
          ${escapeHtml(resource.resource_type)}
        </span>
      </td>

      <td>
        ${
          resource.lesson_title
            ? `Lesson ${resource.lesson_order}: ${escapeHtml(resource.lesson_title)}`
            : "No lesson"
        }
      </td>

      <td>
        ${
          resource.external_url
            ? `<a href="${escapeHtml(resource.external_url)}" target="_blank" rel="noopener">External</a><br />`
            : ""
        }

        ${
          resource.file_url
            ? `<a href="${escapeHtml(resource.file_url)}" target="_blank" rel="noopener">File</a>`
            : ""
        }

        ${
          !resource.external_url && !resource.file_url
            ? "No link"
            : ""
        }
      </td>

      <td>
        <div class="module-actions">
          <button class="btn btn-secondary" data-edit-resource="${resource.id}">
            Edit
          </button>

          <button class="btn btn-secondary" data-delete-resource="${resource.id}">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function saveResource(event) {
  event.preventDefault();

  if (!selectedModule) {
    showMessage("Select a module first.", "error");
    return;
  }

  const resourceId = document.getElementById("resourceId").value;

  const payload = {
    module_id: selectedModule.id,
    lesson_id: document.getElementById("resourceLesson").value || null,
    title: document.getElementById("resourceTitle").value.trim(),
    description: document.getElementById("resourceDescription").value.trim() || null,
    resource_type: document.getElementById("resourceType").value,
    file_url: document.getElementById("resourceFileUrl").value.trim() || null,
    external_url: document.getElementById("resourceExternalUrl").value.trim() || null
  };

  try {
    if (resourceId) {
      await apiRequest(`/admin/learning/resources/${resourceId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      showMessage("Resource updated successfully.", "success");
    } else {
      await apiRequest("/admin/learning/resources", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showMessage("Resource added successfully.", "success");
    }

    resetResourceForm();

    if (selectedModule) {
      await loadSelectedModuleContent(selectedModule.id);
      await loadModules();
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function fillResourceForm(resource) {
  document.getElementById("resourceFormTitle").textContent = "Edit Resource";
  document.getElementById("saveResourceButton").textContent = "Update Resource";

  document.getElementById("resourceId").value = resource.id;
  document.getElementById("resourceTitle").value = resource.title || "";
  document.getElementById("resourceDescription").value = resource.description || "";
  document.getElementById("resourceType").value = resource.resource_type || "text";
  document.getElementById("resourceLesson").value = resource.lesson_id || "";
  document.getElementById("resourceFileUrl").value = resource.file_url || "";
  document.getElementById("resourceExternalUrl").value = resource.external_url || "";
}

function resetResourceForm() {
  document.getElementById("resourceForm").reset();
  document.getElementById("resourceId").value = "";
  document.getElementById("resourceFormTitle").textContent = "Add Resource";
  document.getElementById("saveResourceButton").textContent = "Add Resource";
  document.getElementById("resourceType").value = "text";
  document.getElementById("resourceLesson").value = "";
}

async function deleteResource(resourceId) {
  const confirmed = confirm("Delete this resource?");

  if (!confirmed) return;

  try {
    await apiRequest(`/admin/learning/resources/${resourceId}`, {
      method: "DELETE"
    });

    showMessage("Resource deleted successfully.", "success");
    resetResourceForm();

    if (selectedModule) {
      await loadSelectedModuleContent(selectedModule.id);
      await loadModules();
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

/* -----------------------------
   Helpers
----------------------------- */

function showMessage(message, type = "success") {
  const messageBox = document.getElementById("adminLearningMessage");

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