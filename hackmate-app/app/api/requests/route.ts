import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db-admin';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { receiverId, receiver_id, message } = await req.json();
    const finalReceiverId = parseInt(receiverId || receiver_id);
    const sender_id = user.id;

    if (isNaN(finalReceiverId)) {
      return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
    }

    if (sender_id === finalReceiverId) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin.from('team_requests')
      .select('id')
      .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${finalReceiverId}),and(sender_id.eq.${finalReceiverId},receiver_id.eq.${sender_id})`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Request already exists or users are connected' }, { status: 400 });
    }

    const { data: result, error: insertErr } = await supabaseAdmin.from('team_requests')
      // Removed generic message inclusion since it's not present in the DB schema
      .insert([{ sender_id, receiver_id: finalReceiverId, status: 'pending' }])
      .select('id')
      .single();
      
    if (insertErr) throw insertErr;

    const { data: sender } = await supabaseAdmin.from('users').select('name').eq('id', sender_id).single();
    
    if (sender) {
      await supabaseAdmin.from('notifications').insert([{ user_id: finalReceiverId, message: `${sender.name} wants to team up with you!` }]);
    }

    return NextResponse.json({ id: result.id, message: 'Request sent successfully' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
