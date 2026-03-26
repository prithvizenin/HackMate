import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: requests, error } = await supabase.from('team_requests')
      .select('id, sender_id, status, created_at, sender:users!team_requests_sender_id_fkey(name, college, role)')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = requests?.map(r => ({
      id: r.id,
      sender_id: r.sender_id,
      status: r.status,
      created_at: r.created_at,
      name: (r.sender as any)?.name,
      college: (r.sender as any)?.college,
      role: (r.sender as any)?.role
    })) || [];
    
    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


