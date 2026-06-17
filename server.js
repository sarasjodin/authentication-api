/* Authentication application API built with Express and SQLite.
This server will handle user registration, login, and token-based authentication.
 */

require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
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

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./sqlite_data/authentication.db');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    account_created DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
