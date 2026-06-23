/* Authentication application API built with Express and SQLite.
This server will handle user registration, login, and token-based authentication.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables based on environment
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';

dotenv.config({
  path: path.resolve(__dirname, envFile)
});

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Only my specific frontends may do browser requests.
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

// Health route endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'authentication-api' });
});

// Authentication routes
app.use('/api', authRoutes);

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DATABASE_URL);

// Create users table if not exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.listen(PORT, () => {
  console.log(`Authentication API running on port ${PORT}`);
});
