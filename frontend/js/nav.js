/**
 * nav.js
 * ----------------------------------------------------
 * Small helper for role-aware navigation.
 *
 * If the logged-in user is an admin, show links with:
 * class="admin-only-link"
 */

document.addEventListener("DOMContentLoaded", async () => {
  await showAdminLinksIfNeeded();
});

async function showAdminLinksIfNeeded() {
  const adminLinks = document.querySelectorAll(".admin-only-link");

  if (!adminLinks.length) return;

  const token = localStorage.getItem("eduhub_token");

  if (!token) return;

  try {
    const data = await apiRequest("/auth/me");

    if (data.user && data.user.role === "admin") {
      adminLinks.forEach((link) => {
        link.style.display = "inline-flex";
      });
    }
  } catch (error) {
    console.error("Could not check user role for navigation:", error);
  }
}