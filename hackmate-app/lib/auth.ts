import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { id: number; [key: string]: any };
  } catch (err) {
    return null;
  }
}
