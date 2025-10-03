import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET - Buscar favoritos de um usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          f.id,
          f.data_favorito,
          m.id as manga_id,
          m.titulo,
          m.autor,
          m.capa,
          m.status,
          m.visualizacoes,
          m.data_adicao
        FROM favoritos f
        JOIN mangas m ON f.manga_id = m.id
        WHERE f.usuario_id = $1
        ORDER BY f.data_favorito DESC
      `;

      const result = await client.query(query, [userId]);
      
      return NextResponse.json({
        success: true,
        favoritos: result.rows
      });

    } finally {
      client.release();
    }

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

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verificar se o favorito já existe
      const existingFavorito = await client.query(
        'SELECT id FROM favoritos WHERE usuario_id = $1 AND manga_id = $2',
        [userId, mangaId]
      );

      if (existingFavorito.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: true,
          message: 'Mangá já está nos favoritos',
          favoritado: true
        });
      }

      // Inserir novo favorito
      const result = await client.query(
        'INSERT INTO favoritos (usuario_id, manga_id) VALUES ($1, $2) RETURNING id, data_favorito',
        [userId, mangaId]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Mangá adicionado aos favoritos',
        favorito: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

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

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND manga_id = $2 RETURNING id',
        [userId, mangaId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Favorito não encontrado'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Favorito removido com sucesso'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
