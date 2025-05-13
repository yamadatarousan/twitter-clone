import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ユーザープロフィールの取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー自身のプロフィールのみ取得可能
    if (session.user.id !== params.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [rows] = await pool.query('SELECT id, email, username FROM users WHERE id = ?', [params.id]);
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ユーザープロフィールの更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー自身のプロフィールのみ更新可能
    if (session.user.id !== params.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { username } = await request.json();

    // usernameの検証（必要に応じて）
    if (username && username.length > 50) {
      return NextResponse.json({ message: 'Username too long (max 50 characters)' }, { status: 400 });
    }

    await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, params.id]);

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 