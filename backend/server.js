require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'EduHub backend is running',
    status: 'success'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is healthy',
    uptime: process.uptime()
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS current_time');

    res.json({
      message: 'Database connection successful',
      current_time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection error:', error.message);

    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`EduHub backend server is running on port ${PORT}`);
});
