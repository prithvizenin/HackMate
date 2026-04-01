import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/db-admin';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: userData, error: userError } = await supabase.from('users')
    .select('id, name, email, college, year, role, bio')
    .eq('id', id)
    .maybeSingle();

  if (!userData || userError) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  try {
    const { data: skills } = await supabase.from('skills').select('id, skill_name, proficiency').eq('user_id', id);
    const { data: achievements } = await supabase.from('achievements').select('id, title, description').eq('user_id', id);

    const currentUser = await getUserFromToken(req);
    const targetId = parseInt(id);

    let connectionStatus = 'none';
    if (currentUser) {
      const { data: tr } = await supabase.from('team_requests')
        .select('status, sender_id')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (tr) {
        if (tr.status === 'accepted') {
          connectionStatus = 'connected';
        } else if (tr.status === 'pending') {
          connectionStatus = tr.sender_id === currentUser.id ? 'pending' : 'incoming_pending';
        }
      }
    }

    return NextResponse.json({ ...userData, skills: skills || [], achievements: achievements || [], connectionStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

