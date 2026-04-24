requireAuth();

async function loadDashboard() {
  try {
    const data = await apiRequest('/auth/me');
    const user = data.user;

    localStorage.setItem('eduhub_user', JSON.stringify(user));

    document.getElementById('welcomeTitle').textContent =
      `Welcome, ${user.full_name}`;

    document.getElementById('profileName').textContent = user.full_name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileStudentId').textContent =
      user.student_id || 'Not provided';
    document.getElementById('profileProgram').textContent =
      user.program || 'Not provided';
    document.getElementById('profileYear').textContent =
      user.year_of_study || 'Not provided';
    document.getElementById('profileRole').textContent = user.role;
  } catch (error) {
    alert('Session expired. Please login again.');
    logout();
  }
}

loadDashboard();
