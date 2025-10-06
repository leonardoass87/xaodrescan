import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'supersegredo_dev';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  userId: number;
  email_confirmado?: boolean;
}

export function verifyToken(request: NextRequest): { success: boolean; payload?: TokenPayload; error?: string } {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userId = payload.userId || payload.id;

    if (!userId) {
      return { success: false, error: 'Token inválido' };
    }

    return {
      success: true,
      payload: {
        id: parseInt(userId),
        email: payload.email,
        role: payload.role,
        userId: parseInt(userId),
        email_confirmado: payload.email_confirmado
      }
    };
  } catch (error) {
    return { success: false, error: 'Token inválido' };
  }
}

export function generateToken(payload: Omit<TokenPayload, 'userId'> & { userId: number; email_confirmado?: boolean }): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      userId: payload.userId,
      email_confirmado: payload.email_confirmado
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}
