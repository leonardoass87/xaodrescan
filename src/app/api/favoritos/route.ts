import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar favoritos de um usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const favoritos = await prisma.favorito.findMany({
      where: { usuario_id: parseInt(userId) },
      include: {
        manga: true
      },
      orderBy: { data_favorito: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      favoritos: favoritos.map(f => ({
        id: f.id,
        data_favorito: f.data_favorito,
        manga_id: f.manga.id,
        titulo: f.manga.titulo,
        autor: f.manga.autor,
        capa: f.manga.capa,
        status: f.manga.status,
        visualizacoes: f.manga.visualizacoes,
        data_adicao: f.manga.data_adicao
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar favorito
export async function POST(request: NextRequest) {
  try {
    const { userId, mangaId } = await request.json();

    if (!userId || !mangaId) {
      return NextResponse.json(
        { error: 'userId e mangaId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o favorito já existe
    const existingFavorito = await prisma.favorito.findFirst({
      where: {
        usuario_id: parseInt(userId),
        manga_id: parseInt(mangaId)
      }
    });

    if (existingFavorito) {
      return NextResponse.json({
        success: true,
        message: 'Mangá já está nos favoritos',
        favoritado: true
      });
    }

    // Inserir novo favorito
    const favorito = await prisma.favorito.create({
      data: {
        usuario_id: parseInt(userId),
        manga_id: parseInt(mangaId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mangá adicionado aos favoritos',
      favorito: {
        id: favorito.id,
        data_favorito: favorito.data_favorito
      }
    });

  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover favorito
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mangaId = searchParams.get('mangaId');

    if (!userId || !mangaId) {
      return NextResponse.json(
        { error: 'userId e mangaId são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await prisma.favorito.deleteMany({
      where: {
        usuario_id: parseInt(userId),
        manga_id: parseInt(mangaId)
      }
    });

    if (result.count === 0) {
      return NextResponse.json({
        success: false,
        message: 'Favorito não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Favorito removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
