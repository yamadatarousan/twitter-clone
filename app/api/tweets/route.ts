import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
// import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
      const { content, user_id } = await request.json();
      if (!content || typeof user_id !== 'number' || user_id <= 0) {
        return NextResponse.json({ error: 'Invalid content or user_id' }, { status: 400 });
      }
      const [result] = await pool.query('INSERT INTO tweets (content, user_id) VALUES (?, ?)', [
        content,
        user_id,
      ]);
      return NextResponse.json({ id: (result as any).insertId, content, user_id }, { status: 201 });
    } catch (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: 'Failed to create tweet' }, { status: 500 });
    }
}
  
export async function GET() {
    try {
      const [tweets] = await pool.query('SELECT id, content, created_at FROM tweets ORDER BY created_at DESC');
      return NextResponse.json(tweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { id } = await request.json();
    if (typeof id !== 'number') return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    await pool.query('DELETE FROM tweets WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Tweet deleted' }, { status: 200 });
}