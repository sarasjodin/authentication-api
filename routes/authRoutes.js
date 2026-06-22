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

    if (userName.length < 3 || userName.length > 30) {
      return res.status(400).json({
        message: 'Username must be between 3 and 30 characters'
      });
    }

    if (email.length > 254) {
      return res.status(400).json({
        message: 'Invalid email address'
      });
    }

    if (pass.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Check if user already exists

    const checkSql = `
  SELECT * FROM users
  WHERE username = ? OR email = ?
`;

    db.get(checkSql, [userName, email], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (row) {
        return res
          .status(400)
          .json({ message: 'Username or email already exists' });
      }

      // If user does not exist, create new user
      // Correct - save user (store in database)
      const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.run(sql, [userName, email, hashedPassword], (err) => {
        if (err) {
          return res.status(400).json({ message: 'Error creating user' });
        } else {
          return res.status(201).json({ message: 'User created successfully' });
        }
      });
    });
  } catch (error) {
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
        return res.status(400).json({ message: 'Error authenticating' });
      }

      if (!row) {
        return res
          .status(401)
          .json({ message: 'Incorrect username and/or password' });
      }

      // User exists, check password
      const passwordMatch = await bcrypt.compare(pass, row.password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: 'Incorrect username and/or password' });
      }

      // Create JWT token
      const payload = {
        id: row.id,
        username: row.username,
        created: row.created
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      const responseData = {
        message: 'User logged in successfully!',
        token: token
      };
      return res.status(200).json(responseData);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'You have been authenticated.',
    user: {
      id: req.user.id,
      username: req.user.username,
      created: req.user.created
    }
  });
});

// Validate JWT token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Token (how we send it, without "Bearer")

  // Token missing
  if (!token) {
    return res
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
