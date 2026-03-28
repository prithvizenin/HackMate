import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const adminToken = req.cookies.get('admin_auth')?.value;
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await req.json();
  const { data, error } = await supabase
    .from('announcements')
    .insert([{ title, content }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const { data: users, error: usersError } = await supabase.from('users').select('id');
  if (!usersError && users) {
    let payload: any[] = users.map(u => ({ user_id: u.id, message: title, type: 'announcement' }));
    let res = await supabase.from('notifications').insert(payload);
    
    if (res.error) {
      console.error("Insert type: 'announcement' failed:", res.error.message);
      payload = users.map(u => ({ user_id: u.id, message: title, isAnnouncement: true }));
      res = await supabase.from('notifications').insert(payload);
      
      if (res.error) {
        console.error("Insert isAnnouncement: true failed:", res.error.message);
        payload = users.map(u => ({ user_id: u.id, message: title, is_announcement: true }));
        res = await supabase.from('notifications').insert(payload);
        
        if (res.error) {
           console.error("Insert is_announcement: true failed:", res.error.message);
           // Ultimate fallback if no special columns exist
           payload = users.map(u => ({ user_id: u.id, message: `📢 ANNOUNCEMENT: ${title}` }));
           res = await supabase.from('notifications').insert(payload);
           if (res.error) {
             console.error("Final fallback also failed:", res.error.message);
           }
        }
      }
    }
  } else {
    console.error("Failed to fetch users:", usersError);
  }

  return NextResponse.json(data);
}
