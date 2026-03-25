import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { receiverId, receiver_id } = await req.json();
    const finalReceiverId = parseInt(receiverId || receiver_id);
    const sender_id = user.id;

    if (isNaN(finalReceiverId)) {
      return NextResponse.json({ error: 'Invalid receiver ID' }, { status: 400 });
    }

    if (sender_id === finalReceiverId) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    const existing = db.prepare(`
      SELECT * FROM team_requests 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `).get(sender_id, finalReceiverId, finalReceiverId, sender_id);

    if (existing) {
      return NextResponse.json({ error: 'Request already exists or users are connected' }, { status: 400 });
    }

    const result = db.prepare('INSERT INTO team_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)')
                     .run(sender_id, finalReceiverId, 'pending');

    const sender = db.prepare('SELECT name FROM users WHERE id = ?').get(sender_id) as any;
    db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(finalReceiverId, `${sender.name} wants to team up with you!`);

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Request sent successfully' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
