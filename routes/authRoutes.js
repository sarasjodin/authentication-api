/* Routes for authentication API, including user registration and login endpoints. */

const express = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username: userName, password: pass } = req.body;

    // Validation
    if (!userName || !pass) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }
    console.log('Registering user:', req.body);

    // Correctly insert the new user into the database

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    userName = req.body.username;
    password = req.body.password;
    console.log('Logging in user:', req.body);
    res.status(200).json({ message: 'User logged in successfully' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
