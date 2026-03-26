import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await req.json();
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    const { id } = await params;
    const { data: request } = await supabase.from('team_requests').select('*').eq('id', id).eq('receiver_id', user.id).maybeSingle();
    
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const { error: updateErr } = await supabase.from('team_requests').update({ status }).eq('id', id);
    if (updateErr) throw updateErr;

    const { data: receiver } = await supabase.from('users').select('name').eq('id', user.id).single();
    if (receiver) {
      const msg = status === 'accepted' ? `${receiver.name} accepted your team request!` : `${receiver.name} declined your team request.`;
      await supabase.from('notifications').insert([{ user_id: request.sender_id, message: msg }]);
    }

    return NextResponse.json({ message: `Request ${status}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

