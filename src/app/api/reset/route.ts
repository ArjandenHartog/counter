import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST() {
  try {
    const db = new Database(path.join(process.cwd(), 'db', 'counter.db'));
    
    // Reset counter to 0
    db.prepare('UPDATE counter SET count = 0 WHERE id = 1').run();
    
    // Log the reset
    db.prepare('INSERT INTO logs (action, new_value) VALUES (?, ?)').run('reset', 0);
    
    db.close();
    
    return NextResponse.json({ count: 0, message: 'Counter reset to 0' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}