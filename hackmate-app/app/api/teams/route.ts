import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET /api/teams - List teams the user is in (including pending invites)
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: teamMembers, error } = await supabase.from('team_members')
      .select('role, status, teams(*)')
      .eq('user_id', user.id);
      
    if (error) throw error;

    const transformed = (teamMembers || []).map(tm => ({
       ...(tm.teams as any),
       role: tm.role,
       membership_status: tm.status
    }));
    
    transformed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(transformed);
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

    const { data: team, error: teamErr } = await supabase.from('teams')
      .insert([{ name, creator_id: user.id }])
      .select('id')
      .single();
      
    if (teamErr) throw teamErr;

    const { error: memberErr } = await supabase.from('team_members')
      .insert([{ team_id: team.id, user_id: user.id, role: 'leader', status: 'joined' }]);
      
    if (memberErr) {
      await supabase.from('teams').delete().eq('id', team.id);
      throw memberErr;
    }

    return NextResponse.json({ id: team.id, name, creator_id: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
