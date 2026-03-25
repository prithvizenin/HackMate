import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const requests = db.prepare(`
      SELECT r.id, r.receiver_id, r.status, r.created_at, u.name, u.college, u.role
      FROM team_requests r
      JOIN users u ON r.receiver_id = u.id
      WHERE r.sender_id = ?
      ORDER BY r.created_at DESC
    `).all(user.id);
    
    return NextResponse.json(requests);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
