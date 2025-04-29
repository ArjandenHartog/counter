import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST() {
  try {
    const db = new Database(path.join(process.cwd(), 'db', 'counter.db'));
    
    // Decrement counter (but never below 0)
    db.prepare('UPDATE counter SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE id = 1').run();
    
    // Get updated count
    const result = db.prepare('SELECT count FROM counter WHERE id = 1').get();
    
    // Log the decrement
    db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('verlaagd', result.count);
    
    db.close();
    
    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
} 