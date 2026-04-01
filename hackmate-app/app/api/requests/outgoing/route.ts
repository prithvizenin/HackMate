import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db-admin';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: requests, error } = await supabaseAdmin.from('team_requests')
      .select('id, receiver_id, status, created_at, receiver:users!team_requests_receiver_id_fkey(name, college, role)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = requests?.map(r => ({
      id: r.id,
      receiver_id: r.receiver_id,
      status: r.status,
      created_at: r.created_at,
      name: (r.receiver as any)?.name,
      college: (r.receiver as any)?.college,
      role: (r.receiver as any)?.role
    })) || [];
    
    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
