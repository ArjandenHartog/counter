import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST() {
  try {
    const db = new Database(path.join(process.cwd(), 'db', 'counter.db'));
    
    let result;
    
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
        result = { count: 0 };
      } else {
        // Check current count
        const currentCount = db.prepare('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1').get();
        
        // Only decrement if count > 0
        if (currentCount && currentCount.count > 0) {
          db.prepare('UPDATE teams SET count = count - 1 WHERE id = 1').run();
          
          // Get updated count
          result = db.prepare('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1').get();
          
          // Check if the logs table has a note column
          const logColumnsResult = db.prepare("PRAGMA table_info(logs)").all();
          const hasNoteColumn = logColumnsResult.some(col => col.name === 'note');
          
          // Log the decrement
          if (hasNoteColumn) {
            db.prepare('INSERT INTO logs (action, new_value, note) VALUES (?, ?, ?)').run('team_removed', result.count, 'Team afmelding');
          } else {
            db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('team_removed', result.count);
          }
        } else {
          result = currentCount || { count: 0 };
        }
      }
      
      db.prepare('COMMIT').run();
    } catch (error) {
      db.prepare('ROLLBACK').run();
      db.close();
      throw error;
    }
    
    db.close();
    
    return NextResponse.json({ count: result ? Number(result.count) : 0 });
  } catch (error) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details: errorMessage }, { status: 500 });
  }
} 