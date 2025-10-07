import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verifica o token JWT
    const tokenResult = verifyToken(request);

    if (!tokenResult.success || !tokenResult.payload) {
      return NextResponse.json(
        { error: tokenResult.error || 'Token inválido ou ausente' },
        { status: 401 }
      );
    }

    const { payload } = tokenResult;

    // Garante que o payload tem ID
    if (!payload.id) {
      return NextResponse.json(
        { error: 'Token sem ID de usuário' },
        { status: 401 }
      );
    }

    // Busca o usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        nome: true,
        email: true,
        email_confirmado: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Retorna os dados do usuário autenticado
    return NextResponse.json(
      {
        id: user.id,
        nome: user.nome,
        email: user.email,
        email_confirmado: user.email_confirmado,
        role: user.role,
        created_at: user.created_at,
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
