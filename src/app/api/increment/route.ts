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
      // Increment counter
      db.prepare('UPDATE counter SET count = count + 1 WHERE id = 1').run();
      
      // Get updated count
      result = db.prepare('SELECT count FROM counter WHERE id = 1').get();
      
      // Log the increment
      db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('verhoogd', result.count);
      
      db.prepare('COMMIT').run();
    } catch (error) {
      db.prepare('ROLLBACK').run();
      throw error;
    }
    
    db.close();
    
    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}