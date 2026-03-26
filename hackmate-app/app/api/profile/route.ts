import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, college, year, role, bio, contact } = await req.json();
    
    // We fetch the current user first to deal with COALESCE analog
    const { data: currentUser } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { error } = await supabase
      .from('users')
      .update({
        name: name !== undefined ? name : currentUser.name,
        college: college !== undefined ? college : currentUser.college,
        year: year !== undefined ? year : currentUser.year,
        role: role !== undefined ? role : currentUser.role,
        bio: bio !== undefined ? bio : currentUser.bio,
        contact: contact !== undefined ? contact : currentUser.contact,
      })
      .eq('id', user.id);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
