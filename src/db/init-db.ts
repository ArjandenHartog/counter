import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the db directory exists
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize the database
const dbPath = path.join(dbDir, 'counter.db');

// Check if database exists, and if so, back it up
if (fs.existsSync(dbPath)) {
  const backupPath = `${dbPath}.backup-${Date.now()}`;
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Existing database backed up to ${backupPath}`);
  
  // Delete the existing database to start fresh
  try {
    fs.unlinkSync(dbPath);
    console.log('Removed existing database to create clean schema');
  } catch (err) {
    console.error('Error removing existing database:', err);
  }
}

const db = new Database(dbPath);

// Create tables with transaction for safety
db.prepare('BEGIN').run();

try {
  // Create counter table
  db.prepare(`
    CREATE TABLE counter (
      id INTEGER PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    )
  `).run();

  // Initialize counter
  db.prepare('INSERT INTO counter (id, count) VALUES (1, 0)').run();

  // Create teams table
  db.prepare(`
    CREATE TABLE teams (
      id INTEGER PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    )
  `).run();

  // Initialize teams
  db.prepare('INSERT INTO teams (id, count) VALUES (1, 0)').run();

  // Create logs table
  db.prepare(`
    CREATE TABLE logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT NOT NULL,
      new_value INTEGER NOT NULL,
      note TEXT
    )
  `).run();

  db.prepare('COMMIT').run();
  console.log('Database initialized successfully with clean schema');
} catch (error) {
  db.prepare('ROLLBACK').run();
  console.error('Error initializing database:', error);
}

// Close the database connection
db.close();