import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// PUT - Reordenar páginas de um capítulo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  try {
    // Verificar autenticação
    const tokenResult = verifyToken(request);
    if (!tokenResult.success) {
      return NextResponse.json({ error: tokenResult.error }, { status: 401 });
    }

    const { id, capituloId } = await params;
    const mangaId = parseInt(id);
    const capId = parseInt(capituloId);
    const { ordemPaginas, editado_por, editado_em } = await request.json();

    if (isNaN(mangaId) || isNaN(capId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    if (!ordemPaginas || !Array.isArray(ordemPaginas)) {
      return NextResponse.json({ error: 'Ordem das páginas é obrigatória' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar se o capítulo pertence ao mangá
      const capituloResult = await client.query(
        `SELECT id FROM capitulos WHERE id = $1 AND manga_id = $2`,
        [capId, mangaId]
      );

      if (capituloResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });
      }

      // Atualizar a ordem das páginas
      for (let i = 0; i < ordemPaginas.length; i++) {
        await client.query(
          `UPDATE paginas 
           SET numero = $1, updated_at = $2, editado_por = $3
           WHERE id = $4 AND capitulo_id = $5`,
          [i + 1, editado_em, editado_por, ordemPaginas[i], capId]
        );
      }

      // Atualizar timestamp do capítulo
      await client.query(
        `UPDATE capitulos 
         SET updated_at = $1, editado_por = $2
         WHERE id = $3`,
        [editado_em, editado_por, capId]
      );

      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'Ordem das páginas atualizada com sucesso!'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao reordenar páginas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
