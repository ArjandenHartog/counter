import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Ensure DB directory exists
    const dbDir = path.join(process.cwd(), 'db');
    await fs.mkdir(dbDir, { recursive: true }).catch(() => {});
    
    const db = new Database(path.join(dbDir, 'counter.db'));
    
    // Initialize database if needed
    db.exec(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        count INTEGER NOT NULL DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        new_value INTEGER NOT NULL
      );
    `);
    
    // Check if counter exists, create if not
    const counter = db.prepare('SELECT count FROM counter WHERE id = 1').get();
    if (!counter) {
      db.prepare('INSERT INTO counter (id, count) VALUES (1, 0)').run();
      db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('initialisatie', 0);
    }
    
    // Get current count
    const result = db.prepare('SELECT count FROM counter WHERE id = 1').get();
    db.close();
    
    return NextResponse.json({ count: result ? result.count : 0 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
} 