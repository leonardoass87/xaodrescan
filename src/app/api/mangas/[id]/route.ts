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

// DELETE - Deletar mangá
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = parseInt(params.id);
    
    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Deletar páginas (cascade delete)
      await client.query(`
        DELETE FROM paginas 
        WHERE capitulo_id IN (
          SELECT id FROM capitulos WHERE manga_id = $1
        )
      `, [mangaId]);

      // Deletar capítulos (cascade delete)
      await client.query(`
        DELETE FROM capitulos WHERE manga_id = $1
      `, [mangaId]);

      // Deletar mangá
      const result = await client.query(`
        DELETE FROM mangas WHERE id = $1
      `, [mangaId]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      await client.query('COMMIT');
      
      client.release();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Mangá deletado com sucesso!' 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao deletar mangá:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
