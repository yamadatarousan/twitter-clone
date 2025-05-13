import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ツイート一覧の取得
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.content, t.created_at, t.user_id, u.email as user_email, u.username
      FROM tweets t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ツイートの投稿
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { content, user_id } = await request.json();
    
    // ContentとUser IDの検証
    if (!content) {
      return NextResponse.json({ message: 'Tweet content is required' }, { status: 400 });
    }
    
    // ログインユーザーのIDと一致するか確認
    if (parseInt(session.user.id) !== user_id) {
      return NextResponse.json({ message: 'Cannot tweet as another user' }, { status: 403 });
    }

    const [result] = await pool.query(
      'INSERT INTO tweets (content, user_id) VALUES (?, ?)',
      [content, user_id]
    );
    
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating tweet:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ツイートの削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    // ツイートの所有者を確認
    const [tweets] = await pool.query('SELECT user_id FROM tweets WHERE id = ?', [id]);
    
    if (!Array.isArray(tweets) || tweets.length === 0) {
      return NextResponse.json({ message: 'Tweet not found' }, { status: 404 });
    }
    
    const tweet = tweets[0];
    if (parseInt(session.user.id) !== tweet.user_id) {
      return NextResponse.json({ message: 'Cannot delete another user\'s tweet' }, { status: 403 });
    }

    await pool.query('DELETE FROM tweets WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}