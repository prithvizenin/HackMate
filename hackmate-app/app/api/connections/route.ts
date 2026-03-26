import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

// GET /api/connections - List all users who are 'connected' to the current user
export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: reqs, error } = await supabase
      .from('team_requests')
      .select('sender_id, receiver_id, sender:users!team_requests_sender_id_fkey(id, name, email, role, college), receiver:users!team_requests_receiver_id_fkey(id, name, email, role, college)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    const connections = (reqs || []).map((r: any) => {
      const isSender = r.sender_id === user.id;
      return isSender ? r.receiver : r.sender;
    });

    return NextResponse.json(connections);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
