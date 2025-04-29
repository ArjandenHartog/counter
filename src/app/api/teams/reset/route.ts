import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST() {
  try {
    const db = new Database(path.join(process.cwd(), 'db', 'counter.db'));
    
    // Use a transaction for better performance
    db.prepare('BEGIN').run();
    try {
      // Check if teams table exists
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='teams'").get();
      
      if (!tableExists) {
        // Create teams table if it doesn't exist
        db.prepare(`
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
          )
        `).run();
        
        // Initialize with 0 teams
        db.prepare('INSERT INTO teams (id, count) VALUES (1, 0)').run();
      } else {
        // Reset counter to 0
        db.prepare('UPDATE teams SET count = 0 WHERE id = 1').run();
      }
      
      // Check if the logs table has a note column
      const logColumnsResult = db.prepare("PRAGMA table_info(logs)").all();
      const hasNoteColumn = logColumnsResult.some(col => col.name === 'note');
      
      // Log the reset
      if (hasNoteColumn) {
        db.prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)').run('reset', 0, 'Teams reset');
      } else {
        db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('reset', 0);
      }
      
      db.prepare('COMMIT').run();
    } catch (error) {
      db.prepare('ROLLBACK').run();
      db.close();
      throw error;
    }
    
    db.close();
    
    return NextResponse.json({ count: 0 });
  } catch (error) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details: errorMessage }, { status: 500 });
  }
} 