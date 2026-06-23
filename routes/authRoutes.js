/* Routes for authentication API, including user registration, login endpoint and protected routes. */
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Connect to db
const db = new sqlite3.Database(process.env.DATABASE_URL);

/* REGISTER ROUTE */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        message: 'Username must be between 3 and 30 characters'
      });
    }

    if (email.length > 254) {
      return res.status(400).json({
        message: 'Invalid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if username or email already exists
    const checkSql = `
  SELECT * FROM users
  WHERE username = ? OR email = ?
`;

    db.get(checkSql, [username, email], (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (row) {
        return res
          .status(400)
          .json({ message: 'Username or email already exists' });
      }

      // If user does not exist, create new user in db
      const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.run(sql, [username, email, hashedPassword], (err) => {
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

/* LOGIN ROUTE */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username, and password are required' });
    }

    // Check credentials against database
    // Check if user exists
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, row) => {
      if (err) {
        return res.status(400).json({ message: 'Error authenticating' });
      }

      if (!row) {
        return res
          .status(401)
          .json({ message: 'Incorrect username and/or password' });
      }

      // User exists, check password
      const passwordMatch = await bcrypt.compare(password, row.password);

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

/* PROTECTED ROUTE */
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

// Export router to use in other files
module.exports = router;
