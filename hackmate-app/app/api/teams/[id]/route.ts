import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET /api/teams/[id] - Get team details and members
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    // Check if user is a member (even if pending)
    const { data: membership } = await supabase.from('team_members')
      .select('id').eq('team_id', teamId).eq('user_id', user.id).maybeSingle();
      
    if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { data: team } = await supabase.from('teams').select('*, hackathons(title)').eq('id', teamId).single();

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    
    const { data: membersRaw, error: memErr } = await supabase.from('team_members')
      .select('role, status, users!inner(id, name, role, college)')
      .eq('team_id', teamId);

    const members = (membersRaw || []).map((m: any) => ({
      id: m.users.id,
      name: m.users.name,
      user_role: m.users.role,
      college: m.users.college,
      team_role: m.role,
      status: m.status
    }));

    return NextResponse.json({ ...team, members });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

