import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// POST /api/teams/[id]/join - Accept team invitation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: teamIdStr } = await params;
    const teamId = parseInt(teamIdStr);

    if (isNaN(teamId)) return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });

    const { data: membership } = await supabase.from('team_members')
      .select('id').eq('team_id', teamId).eq('user_id', user.id).eq('status', 'pending').maybeSingle();
      
    if (!membership) return NextResponse.json({ error: 'No pending invitation' }, { status: 404 });

    const { error } = await supabase.from('team_members').update({ status: 'joined' }).eq('id', membership.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

