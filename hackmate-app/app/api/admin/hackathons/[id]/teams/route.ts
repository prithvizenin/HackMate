import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminToken = req.cookies.get('admin_auth')?.value;
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('hackathon_id', params.id);

  if (teamsError) return NextResponse.json({ error: teamsError.message }, { status: 500 });
  if (!teams || teams.length === 0) return NextResponse.json([]);

  const teamIds = teams.map(t => t.id);
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .in('team_id', teamIds);

  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 500 });

  const userIds = members?.map(m => m.user_id) || [];
  let usersData: any[] = [];
  
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);
    if (!usersError && users) usersData = users;
  }

  const assembledTeams = teams.map(team => {
    const teamMembers = members?.filter(m => m.team_id === team.id).map(m => {
      const user = usersData.find(u => u.id === m.user_id);
      return { ...m, user };
    }) || [];
    return { ...team, members: teamMembers };
  });

  return NextResponse.json(assembledTeams);
}
