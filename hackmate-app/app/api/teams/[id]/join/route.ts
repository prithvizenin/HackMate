import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/join - Accept team invitation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    const membership = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ? AND status = "pending"')
                         .get(teamId, user.id) as any;
    if (!membership) return NextResponse.json({ error: 'No pending invitation' }, { status: 404 });

    db.prepare('UPDATE team_members SET status = "joined" WHERE id = ?').run(membership.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
