import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/leave - Leave team
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    const { data: membership } = await supabase.from('team_members')
      .select('id, role').eq('team_id', teamId).eq('user_id', user.id).maybeSingle();
      
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 404 });

    if (membership.role === 'leader') {
      // For now, if leader leaves, team is essentially stuck or deleted. 
      // Let's go with deleting the team if the leader leaves for simplicity.
      await supabase.from('teams').delete().eq('id', teamId);
      return NextResponse.json({ success: true, message: 'Team dissolved as leader left' });
    } else {
      await supabase.from('team_members').delete().eq('id', membership.id);
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

