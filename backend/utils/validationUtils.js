function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterInput(data) {
  const errors = [];

  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (data.year_of_study && Number(data.year_of_study) < 1) {
    errors.push('Year of study must be 1 or higher.');
  }

  return errors;
}

function validateLoginInput(data) {
  const errors = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!data.password) {
    errors.push('Password is required.');
  }

  return errors;
}

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
