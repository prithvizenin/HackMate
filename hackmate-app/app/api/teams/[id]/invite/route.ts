import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/invite - Invite a connected user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);
    const body = await req.json();
    const recipientId = parseInt(body.userId);

    if (isNaN(teamId) || isNaN(recipientId)) {
      return NextResponse.json({ error: 'Invalid team or user ID' }, { status: 400 });
    }

    // 1. Is user the leader?
    const membership = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ? AND role = "leader"')
                         .get(teamId, user.id) as any;
    if (!membership) return NextResponse.json({ error: 'Only leaders can invite members' }, { status: 403 });

    // 2. Are they connected?
    const connection = db.prepare(`
      SELECT * FROM team_requests 
      WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND status = 'accepted'
    `).get(user.id, recipientId, recipientId, user.id);
    
    if (!connection) {
      return NextResponse.json({ error: 'Users must be connected to invite' }, { status: 400 });
    }

    // 3. Already in team?
    const existing = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?')
                       .get(teamId, recipientId);
    if (existing) return NextResponse.json({ error: 'User already in team or invited' }, { status: 400 });

    const team = db.prepare('SELECT name FROM teams WHERE id = ?').get(teamId) as any;
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    db.prepare('INSERT INTO team_members (team_id, user_id, role, status) VALUES (?, ?, ?, ?)')
      .run(teamId, recipientId, 'member', 'pending');

    // Notify recipient
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)')
      .run(recipientId, `You've been invited to join team: ${team.name}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invite Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
