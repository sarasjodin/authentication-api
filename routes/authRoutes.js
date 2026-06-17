/* Routes for authentication API, including user registration and login endpoints. */
require('dotenv').config();

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Connect to db
const db = new sqlite3.Database(process.env.DATABASE_URL);

router.post('/register', async (req, res) => {
  try {
    const { username: userName, password: pass } = req.body;

    // Validation
    if (!userName || !pass) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    // Check if user already exists

    const checkSql = `SELECT * FROM users WHERE username = ?`;
    db.get(checkSql, [userName], (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      if (row) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // If user does not exist, create new user
      // Correct - save user (store in database)
      const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
      db.run(sql, [userName, pass], (err) => {
        if (err) {
          console.error('Error querying database:', err.message);
          return res.status(400).json({ message: 'Error creating user' });
        } else {
          return res.status(201).json({ message: 'User created successfully' });
        }
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username: userName, password: pass } = req.body;

    // Validation
    if (!userName || !pass) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }
    if (userName === 'mattias' && pass === 'password') {
      console.log('Logging in user:', req.body);
      res.status(200).json({ message: 'User logged in successfully' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
