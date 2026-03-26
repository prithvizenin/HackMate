import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { error, count } = await supabase.from('achievements')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (error) throw error;
    if (count === 0) return NextResponse.json({ error: 'Achievement not found or unauthorized' }, { status: 404 });
    
    return NextResponse.json({ message: 'Achievement deleted' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

