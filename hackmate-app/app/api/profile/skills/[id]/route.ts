import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const info = db.prepare('DELETE FROM skills WHERE id = ? AND user_id = ?').run(id, user.id);
    if (info.changes === 0) return NextResponse.json({ error: 'Skill not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ message: 'Skill deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
