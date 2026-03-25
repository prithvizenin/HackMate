import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await req.json();
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    const { id } = await params;
    const request = db.prepare('SELECT * FROM team_requests WHERE id = ? AND receiver_id = ?').get(id, user.id) as any;
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    db.prepare('UPDATE team_requests SET status = ? WHERE id = ?').run(status, id);

    const receiver = db.prepare('SELECT name FROM users WHERE id = ?').get(user.id) as any;
    const msg = status === 'accepted' ? `${receiver.name} accepted your team request!` : `${receiver.name} declined your team request.`;
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(request.sender_id, msg);

    return NextResponse.json({ message: `Request ${status}` });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
