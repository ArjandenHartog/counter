import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    const db = new Database(path.join(process.cwd(), 'db', 'counter.db'));
    
    // Use a transaction for better reliability
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
        
        db.prepare('COMMIT').run();
        db.close();
        
        return NextResponse.json({ count: 0 });
      }
      
      // Get team count - use a more robust query that will always return a value
      const result = db.prepare('SELECT COALESCE(count, 0) as count FROM teams WHERE id = 1').get();
      
      db.prepare('COMMIT').run();
      db.close();
      
      return NextResponse.json({ count: result ? Number(result.count) : 0 });
    } catch (error) {
      db.prepare('ROLLBACK').run();
      db.close();
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Database error', details: errorMessage }, { status: 500 });
  }
} 