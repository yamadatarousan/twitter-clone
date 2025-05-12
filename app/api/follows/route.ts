import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { followee_id } = await request.json();
    if (!followee_id || followee_id === parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Invalid followee_id' }, { status: 400 });
    }
    try {
      await pool.query('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)', [
        session.user.id,
        followee_id,
      ]);
      return NextResponse.json({ message: 'Followed' }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Already followed or invalid user' }, { status: 400 });
    }
}
  
export async function DELETE(request: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { followee_id } = await request.json();
    await pool.query('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [
      session.user.id,
      followee_id,
    ]);
    return NextResponse.json({ message: 'Unfollowed' }, { status: 200 });
}

export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const followee_id = searchParams.get('followee_id');
    if (!followee_id) return NextResponse.json({ isFollowing: false });
    const [rows] = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?',
      [session.user.id, followee_id]
    );
    return NextResponse.json({ isFollowing: (rows as any).length > 0 });
}