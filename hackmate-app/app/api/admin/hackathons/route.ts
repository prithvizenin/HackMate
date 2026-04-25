import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import supabase from '@/lib/db';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  const { data, error } = await supabase.from('hackathons').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.cookies.get('admin_auth')?.value;
    if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, start_date, end_date } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    // Use the supabaseAdmin client to bypass RLS policies
    const { data, error: insertError } = await supabaseAdmin
      .from('hackathons')
      .insert([{ title, description, start_date, end_date }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase Admin Insert Error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
