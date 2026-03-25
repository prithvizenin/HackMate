import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
