import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [users] = await pool.query(
      'SELECT id, email FROM users WHERE id != ? AND id NOT IN (SELECT followee_id FROM follows WHERE follower_id = ?)',
      [session.user.id, session.user.id]
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}