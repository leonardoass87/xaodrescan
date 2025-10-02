import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// DELETE - Deletar mangá (versão simplificada)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('id');
    
    if (!mangaId) {
      return NextResponse.json({ error: 'ID do mangá é obrigatório' }, { status: 400 });
    }

    const id = parseInt(mangaId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    console.log('Tentando deletar mangá ID:', id);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Deletar páginas
      await client.query(`
        DELETE FROM paginas 
        WHERE capitulo_id IN (
          SELECT id FROM capitulos WHERE manga_id = $1
        )
      `, [id]);

      // Deletar capítulos
      await client.query(`
        DELETE FROM capitulos WHERE manga_id = $1
      `, [id]);

      // Deletar mangá
      const result = await client.query(`
        DELETE FROM mangas WHERE id = $1
      `, [id]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      await client.query('COMMIT');
      
      client.release();
      
      console.log('Mangá deletado com sucesso:', id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Mangá deletado com sucesso!',
        deletedId: id
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao deletar mangá:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}

