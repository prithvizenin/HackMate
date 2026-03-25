import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role');
    const skill = searchParams.get('skill');
    const search = searchParams.get('search');
    
    let query = `
      SELECT DISTINCT u.id, u.name, u.email, u.college, u.year, u.role, u.bio, u.created_at
      FROM users u
      LEFT JOIN skills s ON u.id = s.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    if (skill) {
      query += ` AND s.skill_name LIKE ?`;
      params.push(`%${skill}%`);
    }
    if (search) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params) as any[];

    // Get current user to check connection status
    const currentUser = getUserFromToken(req);

    const usersWithMetadata = users.map(u => {
      const skills = db.prepare('SELECT id, skill_name, proficiency FROM skills WHERE user_id = ? LIMIT 3').all(u.id);
      
      let connectionStatus = 'none';
      if (currentUser) {
        const tr = db.prepare(`
          SELECT status, sender_id 
          FROM team_requests 
          WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?)
        `).get(currentUser.id, u.id, u.id, currentUser.id) as any;

        if (tr) {
          if (tr.status === 'accepted') {
            connectionStatus = 'connected';
          } else if (tr.status === 'pending') {
            connectionStatus = tr.sender_id === currentUser.id ? 'pending' : 'incoming_pending';
          }
        }
      }

      return { ...u, skills, connectionStatus };
    });

    return NextResponse.json(usersWithMetadata);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
