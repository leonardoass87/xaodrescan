import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// DELETE - Excluir uma página
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paginaId: string }> }
) {
  try {
    // Verificar autenticação
    const tokenResult = verifyToken(request);
    if (!tokenResult.success) {
      return NextResponse.json({ error: tokenResult.error }, { status: 401 });
    }

    const { id, paginaId } = await params;
    const mangaId = parseInt(id);
    const pagId = parseInt(paginaId);
    await request.json();

    if (isNaN(mangaId) || isNaN(pagId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Buscar dados da página para verificar se pertence ao mangá
      const paginaResult = await client.query(
        `SELECT p.*, c.manga_id 
         FROM paginas p 
         JOIN capitulos c ON p.capitulo_id = c.id 
         WHERE p.id = $1 AND c.manga_id = $2`,
        [pagId, mangaId]
      );

      if (paginaResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
      }

      const pagina = paginaResult.rows[0];

      // Deletar arquivo físico se existir
      try {
        if (pagina.imagem && pagina.imagem.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', pagina.imagem);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (fileError) {
        console.warn('Erro ao deletar arquivo físico:', fileError);
        // Continuar mesmo se não conseguir deletar o arquivo
      }

      // Deletar página do banco
      await client.query(`DELETE FROM paginas WHERE id = $1`, [pagId]);

      // Renumerar páginas restantes do capítulo
      const paginasRestantes = await client.query(
        `SELECT id FROM paginas 
         WHERE capitulo_id = $1 
         ORDER BY numero ASC`,
        [pagina.capitulo_id]
      );

      for (let i = 0; i < paginasRestantes.rows.length; i++) {
        await client.query(
          `UPDATE paginas 
           SET numero = $1, updated_at = $2
           WHERE id = $3`,
          [i + 1, new Date(), paginasRestantes.rows[i].id]
        );
      }

      // Atualizar timestamp do capítulo
      await client.query(
        `UPDATE capitulos 
         SET updated_at = $1
         WHERE id = $2`,
        [new Date(), pagina.capitulo_id]
      );

      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'Página excluída com sucesso!'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao excluir página:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
