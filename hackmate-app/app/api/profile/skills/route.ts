import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { skill_name, proficiency } = await req.json();
    if (!skill_name || !proficiency) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    const result = db.prepare('INSERT INTO skills (user_id, skill_name, proficiency) VALUES (?, ?, ?)')
                     .run(user.id, skill_name, proficiency);
    return NextResponse.json({ id: result.lastInsertRowid, skill_name, proficiency });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
