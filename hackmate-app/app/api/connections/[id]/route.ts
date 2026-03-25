import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// DELETE /api/connections/[id] - Remove a connection (delete the team_request)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const targetId = parseInt(id);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Delete the accepted team request between these two users
    const info = db.prepare(`
      DELETE FROM team_requests 
      WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND status = 'accepted'
    `).run(user.id, targetId, targetId, user.id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
