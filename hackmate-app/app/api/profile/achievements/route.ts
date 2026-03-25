import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, description } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const result = db.prepare('INSERT INTO achievements (user_id, title, description) VALUES (?, ?, ?)')
                     .run(user.id, title, description);
    return NextResponse.json({ id: result.lastInsertRowid, title, description });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
