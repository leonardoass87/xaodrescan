import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET - Buscar mangá específico com capítulos e páginas
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = parseInt(params.id);
    
    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Buscar dados do mangá
    const mangaResult = await client.query(`
      SELECT * FROM mangas WHERE id = $1
    `, [mangaId]);

    if (mangaResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
    }

    // Buscar capítulos do mangá
    const capitulosResult = await client.query(`
      SELECT * FROM capitulos 
      WHERE manga_id = $1 
      ORDER BY numero ASC
    `, [mangaId]);

    // Para cada capítulo, buscar suas páginas
    const capitulos = [];
    for (const capitulo of capitulosResult.rows) {
      const paginasResult = await client.query(`
        SELECT * FROM paginas 
        WHERE capitulo_id = $1 
        ORDER BY numero ASC
      `, [capitulo.id]);

      capitulos.push({
        ...capitulo,
        paginas: paginasResult.rows
      });
    }

    const manga = {
      ...mangaResult.rows[0],
      capitulos
    };

    client.release();
    
    return NextResponse.json(manga);

  } catch (error) {
    console.error('Erro ao buscar mangá:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
