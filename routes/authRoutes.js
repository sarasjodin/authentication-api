/* Routes for authentication API, including user registration and login endpoints. */
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to db
const db = new sqlite3.Database(process.env.DATABASE_URL);

router.post('/register', async (req, res) => {
  try {
    const { username: userName, email: email, password: pass } = req.body;

    // Validation
    if (!userName || !pass || !email) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Check if user already exists

    const checkUserSql = `SELECT * FROM users WHERE username = ?`;
    const checkEmailSql = `SELECT * FROM users WHERE email = ?`;
    db.get(checkUserSql, [userName], (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      if (row) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists
      db.get(checkEmailSql, [email], (err, row) => {
        if (err) {
          console.error('Error querying database:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        if (row) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        // If user does not exist, create new user
        // Correct - save user (store in database)
        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [userName, email, hashedPassword], (err) => {
          if (err) {
            console.error('Error querying database:', err.message);
            return res.status(400).json({ message: 'Error creating user' });
          } else {
            return res
              .status(201)
              .json({ message: 'User created successfully' });
          }
        });
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
        .json({ message: 'Username, and password are required' });
    }

    // Check credentials against database
    // Check if user exists
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [userName], async (err, row) => {
      if (err) {
        console.error('Error querying database:', err.message);
        return res.status(400).json({ message: 'Error authenticating' });
      }

      console.log('Username:', userName);

      if (!row) {
        return res
          .status(401)
          .json({ message: 'Incorrect username and/or password' });
      }

      // User exists, check password
      const passwordMatch = await bcrypt.compare(pass, row.password);
      console.log('Password:', passwordMatch);
      console.log('Database row:', row);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: 'Incorrect username and/or password' });
      }

      console.log('Logging in user:', userName);
      // Create JWT token
      const payload = {
        id: row.id,
        username: row.username
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      const responseData = {
        message: 'User logged in successfully!',
        token: token
      };
      return res.status(200).json({ responseData });
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
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
    req.user = user;
    next();
  });
}

module.exports = router;
