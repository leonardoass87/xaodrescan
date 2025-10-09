import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// DELETE - Excluir um capítulo
export async function DELETE(
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

    if (isNaN(mangaId) || isNaN(capId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Buscar dados do capítulo para verificar se pertence ao mangá
      const capituloResult = await client.query(
        `SELECT id, numero, titulo FROM capitulos WHERE id = $1 AND manga_id = $2`,
        [capId, mangaId]
      );

      if (capituloResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });
      }

      const capitulo = capituloResult.rows[0];

      // Buscar todas as páginas do capítulo para deletar arquivos físicos
      const paginasResult = await client.query(
        `SELECT id, imagem FROM paginas WHERE capitulo_id = $1`,
        [capId]
      );

      // Deletar arquivos físicos das páginas
      for (const pagina of paginasResult.rows) {
        try {
          if (pagina.imagem && pagina.imagem.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'uploads', pagina.imagem.replace('/uploads/', ''));
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log('🗑️ Arquivo deletado:', filePath);
            }
          }
        } catch (fileError) {
          console.warn('Erro ao deletar arquivo físico:', fileError);
          // Continuar mesmo se não conseguir deletar o arquivo
        }
      }

      // Deletar páginas do banco
      await client.query(`DELETE FROM paginas WHERE capitulo_id = $1`, [capId]);

      // Deletar capítulo do banco
      await client.query(`DELETE FROM capitulos WHERE id = $1`, [capId]);

      await client.query('COMMIT');
      
      console.log('✅ Capítulo deletado com sucesso:', {
        mangaId,
        capituloId: capId,
        numero: capitulo.numero,
        titulo: capitulo.titulo
      });

      return NextResponse.json({
        success: true,
        message: `Capítulo ${capitulo.numero} deletado com sucesso!`,
        capitulo: {
          id: capId,
          numero: capitulo.numero,
          titulo: capitulo.titulo
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Erro ao deletar capítulo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Buscar dados de um capítulo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  try {
    const { id, capituloId } = await params;
    const mangaId = parseInt(id);
    const capId = parseInt(capituloId);

    if (isNaN(mangaId) || isNaN(capId)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Buscar dados do capítulo e mangá
      const capituloResult = await client.query(
        `SELECT c.*, m.titulo as manga_titulo, m.autor, m.status, m.capa
         FROM capitulos c 
         JOIN mangas m ON c.manga_id = m.id 
         WHERE c.id = $1 AND c.manga_id = $2`,
        [capId, mangaId]
      );

      if (capituloResult.rows.length === 0) {
        return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });
      }

      // Buscar páginas do capítulo
      const paginasResult = await client.query(
        `SELECT id, numero, imagem, legenda FROM paginas WHERE capitulo_id = $1 ORDER BY numero ASC`,
        [capId]
      );

      // Buscar próximo capítulo
      const proximoCapituloResult = await client.query(
        `SELECT id, numero, titulo FROM capitulos 
         WHERE manga_id = $1 AND numero > $2 
         ORDER BY numero ASC LIMIT 1`,
        [mangaId, capituloResult.rows[0].numero]
      );

      const capitulo = {
        ...capituloResult.rows[0],
        paginas: paginasResult.rows
      };

      const manga = {
        id: mangaId,
        titulo: capituloResult.rows[0].manga_titulo,
        autor: capituloResult.rows[0].autor,
        status: capituloResult.rows[0].status,
        capa: capituloResult.rows[0].capa
      };

      const proximoCapitulo = proximoCapituloResult.rows.length > 0 ? proximoCapituloResult.rows[0] : null;

      return NextResponse.json({
        capitulo,
        manga,
        proximoCapitulo
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao buscar capítulo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}