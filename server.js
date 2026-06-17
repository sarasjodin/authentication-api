/* Authentication application API built with Express and SQLite.
This server will handle user registration, login, and token-based authentication.
 */

const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';

dotenv.config({
  path: path.resolve(__dirname, envFile)
});

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Only my specific frontend may do browser requests.
app.use(
  cors({
    origin: [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:5501',
      'http://127.0.0.1:5501',
      'https://my-authentication-lab.netlify.app'
    ]
  })
);
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'authentication-api' });
});

const PORT = process.env.PORT || 3000;

app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Authentication API running on port ${PORT}`);
});

// Protected routes
app.get('/api/protected', authenticateToken, (req, res) => {
  return res.json({ message: 'This is a protected route' });
});

// Validate JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Token (how we send it, without "Bearer")

  // Token missing
  if (!token) {
    res
      .status(401)
      .json({ message: 'Not authorized for this route - token missing' });
  }

  // Token present, verify it
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: 'Not authorized for this route - token invalid' });
    }
    req.userName = user.username;
    next();
  });
}

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.DATABASE_URL);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
