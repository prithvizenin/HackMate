import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/db-admin';
import { getUserFromToken } from '@/lib/auth';

// GET /api/connections - List all users who are 'connected' to the current user
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: trs, error } = await supabase.from('team_requests')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    const friendIds = (trs || []).map(tr => tr.sender_id === user.id ? tr.receiver_id : tr.sender_id);

    if (friendIds.length === 0) return NextResponse.json([]);
    
    const { data: connections, error: usersErr } = await supabase.from('users')
      .select('id, name, email, role, college')
      .in('id', friendIds);
      
    if (usersErr) throw usersErr;

    return NextResponse.json(connections);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


