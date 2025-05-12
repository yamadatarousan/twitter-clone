import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('No session or user ID in GET /api/tweets');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [tweets] = await pool.query(
      'SELECT t.id, t.content, t.created_at, t.user_id, u.email ' +
        'FROM tweets t JOIN users u ON t.user_id = u.id ' +
        'WHERE t.user_id IN (SELECT followee_id FROM follows WHERE follower_id = ?) ' +
        'OR t.user_id = ? ORDER BY t.created_at DESC',
      [session.user.id, session.user.id]
    );
    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('No session or user ID in POST /api/tweets');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { content } = await request.json();
  if (!content) return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  try {
    const [result] = await pool.query('INSERT INTO tweets (content, user_id) VALUES (?, ?)', [
      content,
      session.user.id,
    ]);
    return NextResponse.json({ id: (result as any).insertId, content }, { status: 201 });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json({ error: 'Failed to create tweet' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('No session or user ID in DELETE /api/tweets');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await request.json();
  await pool.query('DELETE FROM tweets WHERE id = ? AND user_id = ?', [id, session.user.id]);
  return NextResponse.json({ message: 'Deleted' }, { status: 200 });
}