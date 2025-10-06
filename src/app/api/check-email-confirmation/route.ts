import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o email foi confirmado
    const userResult = await pool.query(
      'SELECT email_confirmado FROM usuarios WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json(
      { 
        emailConfirmed: user.email_confirmado,
        message: user.email_confirmado ? 'Email confirmado' : 'Email não confirmado'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao verificar confirmação de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

