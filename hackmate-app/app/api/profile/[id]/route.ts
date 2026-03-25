import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = db.prepare('SELECT id, name, email, college, year, role, bio FROM users WHERE id = ?').get(id) as any;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    const skills = db.prepare('SELECT id, skill_name, proficiency FROM skills WHERE user_id = ?').all(user.id);
    const achievements = db.prepare('SELECT id, title, description FROM achievements WHERE user_id = ?').all(user.id);

    const currentUser = getUserFromToken(req);

    const targetId = parseInt(id);

    let connectionStatus = 'none';
    if (currentUser) {
      const tr = db.prepare(`
        SELECT status, sender_id FROM team_requests 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
      `).get(currentUser.id, targetId, targetId, currentUser.id) as any;

      if (tr) {
        if (tr.status === 'accepted') {
          connectionStatus = 'connected';
        } else if (tr.status === 'pending') {
          connectionStatus = tr.sender_id === currentUser.id ? 'pending' : 'incoming_pending';
        }
      }
    }

    return NextResponse.json({ ...user, skills, achievements, connectionStatus });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
