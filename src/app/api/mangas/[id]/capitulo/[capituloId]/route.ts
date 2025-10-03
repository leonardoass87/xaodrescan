import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
      // Buscar dados do mangá
      const mangaResult = await client.query(
        `SELECT id, titulo, autor, status, capa FROM mangas WHERE id = $1`,
        [mangaId]
      );

      if (mangaResult.rows.length === 0) {
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      // Buscar dados do capítulo
      const capituloResult = await client.query(
        `SELECT id, numero, titulo, data_publicacao FROM capitulos WHERE id = $1 AND manga_id = $2`,
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


      const manga = mangaResult.rows[0];
      const capitulo = {
        ...capituloResult.rows[0],
        paginas: paginasResult.rows
      };


      const response = NextResponse.json({
        manga,
        capitulo
      });

      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao buscar capítulo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
