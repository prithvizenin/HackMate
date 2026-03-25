import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET /api/teams/[id] - Get team details and members
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    // Check if user is a member (even if pending)
    const membership = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?')
                         .get(teamId, user.id);
    if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as any;
    
    const members = db.prepare(`
      SELECT u.id, u.name, u.role as user_role, u.college, tm.role as team_role, tm.status
      FROM users u
      JOIN team_members tm ON u.id = tm.user_id
      WHERE tm.team_id = ?
    `).all(teamId);

    return NextResponse.json({ ...team, members });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
