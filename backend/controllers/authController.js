const db = require('../db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/tokenUtils');
const {
  validateRegisterInput,
  validateLoginInput
} = require('../utils/validationUtils');

async function register(req, res) {
  try {
    const errors = validateRegisterInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    const {
      full_name,
      email,
      password,
      student_id,
      program,
      year_of_study
    } = req.body;

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email is already registered.'
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users
        (full_name, email, password_hash, student_id, program, year_of_study, role)
       VALUES
        ($1, $2, $3, $4, $5, $6, 'student')
       RETURNING id, full_name, email, student_id, program, year_of_study, role, created_at`,
      [
        full_name.trim(),
        email.toLowerCase(),
        passwordHash,
        student_id || null,
        program || null,
        year_of_study || null
      ]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Email or student ID already exists.'
      });
    }

    res.status(500).json({
      message: 'Server error during registration.'
    });
  }
}

async function login(req, res) {
  try {
    const errors = validateLoginInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, full_name, email, password_hash, student_id, program,
              year_of_study, role, avatar_url, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: 'Your account has been deactivated.'
      });
    }

    const passwordMatches = await comparePassword(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    delete user.password_hash;

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error during login.'
    });
  }
}

async function getMe(req, res) {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, student_id, program, year_of_study,
              role, avatar_url, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get me error:', error);

    res.status(500).json({
      message: 'Server error while loading profile.'
    });
  }
}

module.exports = {
  register,
  login,
  getMe
};
