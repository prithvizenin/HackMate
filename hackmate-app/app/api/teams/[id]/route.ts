import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
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
    const { data: membership } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { data: team } = await supabase.from('teams').select('*').eq('id', teamId).single();
    
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('role, status, user_id, users(id, name, role, college)')
      .eq('team_id', teamId);

    const members = (teamMembers || []).map((tm: any) => ({
      id: tm.user_id,
      name: tm.users?.name,
      user_role: tm.users?.role,
      college: tm.users?.college,
      team_role: tm.role,
      status: tm.status
    }));

    return NextResponse.json({ ...team, members });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
