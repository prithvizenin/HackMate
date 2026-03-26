import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, description } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const { data: result, error } = await supabase.from('achievements')
      .insert([{ user_id: user.id, title, description }])
      .select('id')
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ id: result.id, title, description });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


