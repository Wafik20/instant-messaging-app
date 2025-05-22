import path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname safely
const dbPath = path.join(__dirname, 'db', 'database.sqlite');

import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

// Function to add a new user
function addUser(username, password) {
  const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
  stmt.run(username, password, function (err) {
    if (err) {
      console.error('Error adding user:', err);
    } else {
      console.log(`User added with ID: ${this.lastID}`);
    }
  });
  stmt.finalize();
}

// Function to fetch user by username
function getUserByUsername(username, callback) {
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      callback(null);
    } else {
      callback(row);
    }
  });
}

export { addUser, getUserByUsername, db };
