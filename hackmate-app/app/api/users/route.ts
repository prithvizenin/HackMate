import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/db-admin';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role');
    const skill = searchParams.get('skill');
    const search = searchParams.get('search');
    
    const selectStr = skill 
      ? 'id, name, email, college, year, role, bio, created_at, skills!inner(id, skill_name, proficiency)'
      : 'id, name, email, college, year, role, bio, created_at, skills(id, skill_name, proficiency)';

    let query = supabase.from('users').select(selectStr);

    if (role) {
      query = query.eq('role', role);
    }
    if (skill) {
      query = query.ilike('skills.skill_name', `%${skill}%`);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: users, error } = await query;
    if (error) throw error;

    const currentUser = await getUserFromToken(req);

    // Filter duplicates because inner join might return the same user multiple times if they have multiple matching skills
    const uniqueUsersSet = new Set();
    const uniqueUsers = ((users as any[]) || []).filter((u: any) => {
      if (uniqueUsersSet.has(u.id)) return false;
      uniqueUsersSet.add(u.id);
      return true;
    });

    // Fetch all connections for the current user ONCE to avoid N+1 query problem
    let userConnections: any[] = [];
    if (currentUser) {
      const { data: connections } = await supabase.from('team_requests')
        .select('status, sender_id, receiver_id')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
      if (connections) {
        userConnections = connections;
      }
    }


    const usersWithMetadata = await Promise.all(uniqueUsers.map(async (u: any) => {
      // take up to 3 skills
      const userSkills = (u.skills || []).slice(0, 3);
      const userWithoutSkills = { ...u };
      delete (userWithoutSkills as any).skills;
      
      let connectionStatus = 'none';
      if (currentUser) {
        const tr = userConnections.find((c: any) => 
          (c.sender_id === currentUser.id && c.receiver_id === u.id) || 
          (c.sender_id === u.id && c.receiver_id === currentUser.id)
        );

        if (tr) {
          if (tr.status === 'accepted') {
            connectionStatus = 'connected';
          } else if (tr.status === 'pending') {
            connectionStatus = tr.sender_id === currentUser.id ? 'pending' : 'incoming_pending';
          }
        }
      }

      return { ...userWithoutSkills, skills: userSkills, connectionStatus };
    }));

    return NextResponse.json(usersWithMetadata);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


