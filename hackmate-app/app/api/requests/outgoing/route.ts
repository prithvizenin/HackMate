import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: reqs, error } = await supabase
      .from('team_requests')
      .select('id, receiver_id, status, created_at, receiver:users!team_requests_receiver_id_fkey(name, college, role)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const requests = (reqs || []).map((r: any) => ({
      id: r.id,
      receiver_id: r.receiver_id,
      status: r.status,
      created_at: r.created_at,
      name: r.receiver?.name,
      college: r.receiver?.college,
      role: r.receiver?.role
    }));

    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
