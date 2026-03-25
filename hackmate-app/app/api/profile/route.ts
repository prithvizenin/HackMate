import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, college, year, role, bio, contact } = await req.json();
    const info = db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          college = COALESCE(?, college),
          year = COALESCE(?, year),
          role = COALESCE(?, role),
          bio = COALESCE(?, bio),
          contact = COALESCE(?, contact)
      WHERE id = ?
    `).run(name, college, year, role, bio, contact, user.id);

    if (info.changes === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ message: 'Profile updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
