import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET /api/connections - List all users who are 'connected' to the current user
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const connections = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.college
      FROM users u
      JOIN team_requests tr ON (u.id = tr.sender_id OR u.id = tr.receiver_id)
      WHERE (tr.sender_id = ? OR tr.receiver_id = ?)
      AND tr.status = 'accepted'
      AND u.id != ?
    `).all(user.id, user.id, user.id);

    return NextResponse.json(connections);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
