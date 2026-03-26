import { NextRequest } from 'next/server';
import supabase from '@/lib/db';

export async function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  // Find in public.users by email to keep API returns consistent
  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();
    
  if (publicUser) return publicUser;
  return null;
}
