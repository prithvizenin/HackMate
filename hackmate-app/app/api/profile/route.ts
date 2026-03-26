import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, college, year, role, bio, contact } = await req.json();
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (college !== undefined) updates.college = college;
    if (year !== undefined) updates.year = year;
    if (role !== undefined) updates.role = role;
    if (bio !== undefined) updates.bio = bio;
    if (contact !== undefined) updates.contact = contact;

    const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select('id');
    if (error || !data || data.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


