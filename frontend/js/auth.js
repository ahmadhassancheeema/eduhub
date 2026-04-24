function saveAuthData(token, user) {
  localStorage.setItem('eduhub_token', token);
  localStorage.setItem('eduhub_user', JSON.stringify(user));
}

function getAuthToken() {
  return localStorage.getItem('eduhub_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('eduhub_user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('eduhub_token');
  localStorage.removeItem('eduhub_user');
  window.location.href = 'login.html';
}

function requireAuth() {
  const token = getAuthToken();

  if (!token) {
    window.location.href = 'login.html';
  }
}
