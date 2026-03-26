import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/invite - Invite a connected user
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);
    const body = await req.json();
    const recipientId = parseInt(body.userId);

    if (isNaN(teamId) || isNaN(recipientId)) {
      return NextResponse.json({ error: 'Invalid team or user ID' }, { status: 400 });
    }

    // 1. Is user the leader?
    const { data: membership } = await supabase.from('team_members')
      .select('id').eq('team_id', teamId).eq('user_id', user.id).eq('role', 'leader').maybeSingle();
      
    if (!membership) return NextResponse.json({ error: 'Only leaders can invite members' }, { status: 403 });

    // 2. Are they connected?
    const { data: connection } = await supabase.from('team_requests')
      .select('id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .maybeSingle();
    
    if (!connection) {
      return NextResponse.json({ error: 'Users must be connected to invite' }, { status: 400 });
    }

    // 3. Already in team?
    const { data: existing } = await supabase.from('team_members')
      .select('id').eq('team_id', teamId).eq('user_id', recipientId).maybeSingle();
      
    if (existing) return NextResponse.json({ error: 'User already in team or invited' }, { status: 400 });

    const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).single();
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    const { error: inviteErr } = await supabase.from('team_members')
      .insert([{ team_id: teamId, user_id: recipientId, role: 'member', status: 'pending' }]);
    if (inviteErr) throw inviteErr;

    // Notify recipient
    await supabase.from('notifications')
      .insert([{ user_id: recipientId, message: `You've been invited to join team: ${team.name}` }]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invite Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

