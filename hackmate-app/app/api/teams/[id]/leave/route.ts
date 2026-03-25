import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/leave - Leave team
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    const membership = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, user.id) as any;
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 404 });

    if (membership.role === 'leader') {
      // For now, if leader leaves, team is essentially stuck or deleted. 
      // Let's go with deleting the team if the leader leaves for simplicity.
      db.prepare('DELETE FROM teams WHERE id = ?').run(teamId);
      return NextResponse.json({ success: true, message: 'Team dissolved as leader left' });
    } else {
      db.prepare('DELETE FROM team_members WHERE id = ?').run(membership.id);
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
