import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const otherUserIdStr = url.searchParams.get('userId');
  
  if (!otherUserIdStr) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  const otherUserId = parseInt(otherUserIdStr);
  if (isNaN(otherUserId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    // Basic authorization: Verify connection exists
    const { data: trs } = await supabase.from('team_requests')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (!trs) {
       return NextResponse.json({ error: 'Not connected with this user' }, { status: 403 });
    }

    // Only fetch messages from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: messages, error } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(messages || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { receiverId, content } = await req.json();
    const receiver_id = parseInt(receiverId);

    if (isNaN(receiver_id) || !content?.trim()) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { data: trs } = await supabase.from('team_requests')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (!trs) {
       return NextResponse.json({ error: 'Not connected with this user' }, { status: 403 });
    }

    const { data, error } = await supabase.from('messages')
      .insert([{ sender_id: user.id, receiver_id, content: content.trim() }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
