/* Initialize SQLite database and create the users table. */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DATABASE_URL);

// Create table users if not exists
db.serialize(() => {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    }
  );
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database connection:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
