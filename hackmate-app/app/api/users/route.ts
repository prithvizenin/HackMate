import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role');
    const skill = searchParams.get('skill');
    const search = searchParams.get('search');
    
    let query = supabase.from('users').select('id, name, email, college, year, role, bio, created_at').order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (skill) {
      const { data: skillMatches } = await supabase.from('skills').select('user_id').ilike('skill_name', `%${skill}%`);
      if (!skillMatches || skillMatches.length === 0) {
        return NextResponse.json([]);
      }
      const userIds = skillMatches.map((s: any) => s.user_id);
      query = query.in('id', userIds);
    }

    const { data: users, error: usersError } = await query;
    if (usersError) throw usersError;

    // Get current user to check connection status
    const currentUser = getUserFromToken(req);

    const usersWithMetadata = await Promise.all((users || []).map(async (u: any) => {
      const { data: skills } = await supabase.from('skills').select('id, skill_name, proficiency').eq('user_id', u.id).limit(3);
      
      let connectionStatus = 'none';
      if (currentUser) {
        const { data: tr } = await supabase.from('team_requests')
          .select('status, sender_id')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${u.id}),and(sender_id.eq.${u.id},receiver_id.eq.${currentUser.id})`)
          .maybeSingle();

        if (tr) {
          if (tr.status === 'accepted') {
            connectionStatus = 'connected';
          } else if (tr.status === 'pending') {
            connectionStatus = tr.sender_id === currentUser.id ? 'pending' : 'incoming_pending';
          }
        }
      }

      return { ...u, skills: skills || [], connectionStatus };
    }));

    return NextResponse.json(usersWithMetadata);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
