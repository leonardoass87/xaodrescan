import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';


export async function GET(request: NextRequest) {
  try {
    // Verificar token
    const tokenResult = verifyToken(request);
    
    if (!tokenResult.success) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 401 }
      );
    }

    const { payload } = tokenResult;

    // Buscar dados do usuário
    const user = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        nome: true,
        email: true,
        email_confirmado: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

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

