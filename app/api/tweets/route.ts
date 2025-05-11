import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    const { content, user_id } = await request.json();
    try {
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO tweets (content, user_id) VALUES (?, ?)', [content, user_id]);
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Database insert error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create tweet' }, { status: 500 });
    }
}