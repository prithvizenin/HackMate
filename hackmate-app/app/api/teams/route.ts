import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET /api/teams - List teams the user is in (including pending invites)
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const teams = db.prepare(`
      SELECT t.*, tm.role, tm.status as membership_status
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ?
      ORDER BY t.created_at DESC
    `).all(user.id);

    return NextResponse.json(teams);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/teams - Create a new team
export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Team name is required' }, { status: 400 });

    const transaction = db.transaction(() => {
      const teamResult = db.prepare('INSERT INTO teams (name, creator_id) VALUES (?, ?)')
                           .run(name, user.id);
      const teamId = teamResult.lastInsertRowid;

      db.prepare('INSERT INTO team_members (team_id, user_id, role, status) VALUES (?, ?, ?, ?)')
        .run(teamId, user.id, 'leader', 'joined');
      
      return teamId;
    });

    const teamId = transaction();

    return NextResponse.json({ id: teamId, name, creator_id: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
