import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token não encontrado' },
        { status: 401 }
      );
    }

    // TODO: Implementar lógica de autenticação adequada
    const userId = '1'; // Placeholder - implementar lógica real

    // Buscar dados do usuário
    const userResult = await pool.query(
      'SELECT id, nome, email, email_confirmado FROM usuarios WHERE id = $1',
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
        id: user.id,
        nome: user.nome,
        email: user.email,
        email_confirmado: user.email_confirmado
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

