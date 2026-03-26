import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { skill_name, proficiency } = await req.json();
    if (!skill_name || !proficiency) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    const { data: result, error } = await supabase.from('skills')
      .insert([{ user_id: user.id, skill_name, proficiency }])
      .select('id')
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ id: result.id, skill_name, proficiency });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


