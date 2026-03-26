import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

// GET /api/teams - List teams the user is in (including pending invites)
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('role, status, team_id, teams(*)')
      .eq('user_id', user.id);

    if (error) throw error;

    // Supabase can't order easily by joined table properties natively without RPC sometimes,
    // so let's do soft-sort here based on teams created_at:
    const teams = (teamMembers || [])
      .map((tm: any) => ({
        ...tm.teams,
        role: tm.role,
        membership_status: tm.status
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name, creator_id: user.id }])
      .select('id')
      .single();

    if (teamError) throw teamError;
    const teamId = team.id;

    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: user.id, role: 'leader', status: 'joined' }]);

    if (memberError) throw memberError;

    return NextResponse.json({ id: teamId, name, creator_id: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
