import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function POST(req: Request) {
  let bodyText = '';
  try {
    bodyText = await req.text();
    if (!bodyText) {
      console.error('Empty body received in sync route');
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse sync body:', bodyText);
      return NextResponse.json({ error: 'Invalid JSON', details: bodyText }, { status: 400 });
    }

    const { name, email } = payload;
    console.log(`Syncing user: ${email} (${name})`);
    
    // ... rest of the logic
    if (!name || !email) {
      return NextResponse.json({ error: 'Missing name or email fields' }, { status: 400 });
    }

    const { data: existing, error: findError } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    
    if (findError) {
      console.error('Error finding existing user:', findError);
      throw findError;
    }

    if (existing) {
      console.log('User already synced:', email);
      return NextResponse.json({ message: 'User already synced', userId: existing.id }, { status: 200 });
    }

    const { data: result, error } = await supabase.from('users')
      .insert([{ name, email, password: 'supabase-auth-managed' }])
      .select('id')
      .single();

    if (error) {
      console.error('Insert error during sync:', error);
      throw error;
    }

    console.log('User synced successfully:', email, 'ID:', result.id);
    return NextResponse.json({ message: 'User synced successfully', userId: result.id }, { status: 201 });
  } catch (error: any) {
    console.error('Detailed Sync error:', error, 'Raw body:', bodyText);
    return NextResponse.json({ 
      error: error.message || 'Server error during sync',
      details: error.details || '',
      raw: error // Send the whole error object for debugging
    }, { status: 500 });
  }
}


