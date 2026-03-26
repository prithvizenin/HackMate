import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // We use inner join simulation by passing foreignTable relation
    // team_requests -> users (sender_id)
    const { data: reqs, error } = await supabase
      .from('team_requests')
      .select('id, sender_id, status, created_at, sender:users!team_requests_sender_id_fkey(name, college, role)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const requests = (reqs || []).map((r: any) => ({
      id: r.id,
      sender_id: r.sender_id,
      status: r.status,
      created_at: r.created_at,
      name: r.sender?.name,
      college: r.sender?.college,
      role: r.sender?.role
    }));

    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
