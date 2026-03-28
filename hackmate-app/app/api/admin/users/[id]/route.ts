import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminToken = req.cookies.get('admin_auth')?.value;
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { is_suspended, is_admin } = body;

  const updates: any = {};
  if (is_suspended !== undefined) updates.is_suspended = is_suspended;
  if (is_admin !== undefined) updates.is_admin = is_admin;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminToken = req.cookies.get('admin_auth')?.value;
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Delete from Supabase Auth if the Service Role Key is available
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const adminAuthClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { error: authError } = await adminAuthClient.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Failed to delete user from auth:", authError);
    }
  } else {
    console.warn("SUPABASE_SERVICE_ROLE_KEY missing, user not deleted from Supabase Auth.");
  }

  return NextResponse.json({ success: true });
}
