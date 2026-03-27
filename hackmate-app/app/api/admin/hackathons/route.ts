import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('hackathons').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get('admin_auth')?.value;
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, start_date, end_date } = await req.json();
  const { data, error } = await supabase
    .from('hackathons')
    .insert([{ title, description, start_date, end_date }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
