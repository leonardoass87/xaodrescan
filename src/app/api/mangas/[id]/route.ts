import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { titulo, autor, generos, status, capa, capitulo } = await request.json();
    const uploadRoot = process.env.UPLOAD_DIR || "./uploads";

    await client.query("BEGIN");

    // Inserir mangá
    const resultManga = await client.query(
      `INSERT INTO mangas (titulo, autor, generos, status, capa, data_adicao)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [titulo, autor, generos, status, ""] // capa será atualizada depois
    );

    const mangaId = resultManga.rows[0].id;
    const mangaDir = path.join(uploadRoot, `${mangaId}`);
    const paginasDir = path.join(mangaDir, "paginas");

    // Cria pastas
    fs.mkdirSync(paginasDir, { recursive: true });

    // Salva a capa
    if (capa) {   
      const relativePath = `${mangaId}/capa.jpg`;
      const capaUrl = `/api/uploads/${relativePath}`;        

      await client.query(`UPDATE mangas SET capa = $1 WHERE id = $2`, [
        capaUrl,
        mangaId,
      ]);
    }

    // Inserir capítulo
    const resultCap = await client.query(
      `INSERT INTO capitulos (manga_id, numero, titulo, data_publicacao)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [mangaId, capitulo.numero, capitulo.titulo]
    );

    const capituloId = resultCap.rows[0].id;

    // Salvar páginas
    for (let i = 0; i < capitulo.paginas.length; i++) {       

      const relativePath = `${mangaId}/paginas/pagina_${i + 1}.jpg`;
      const paginaUrl = `/api/uploads/${relativePath}`;

      await client.query(
        `INSERT INTO paginas (capitulo_id, numero, imagem)
         VALUES ($1, $2, $3)`,
        [capituloId, i + 1, paginaUrl	]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, mangaId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao criar mangá:", error);
    return NextResponse.json({ error: "Erro ao criar mangá" }, { status: 500 });
  } finally {
    client.release();
  }
}

// GET - Buscar mangá específico com capítulos e páginas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();

    // Buscar dados do mangá
    const mangaResult = await client.query(
      `SELECT * FROM mangas WHERE id = $1`,
      [mangaId]
    );

    if (mangaResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
    }

    // Buscar capítulos
    const capitulosResult = await client.query(
      `SELECT * FROM capitulos WHERE manga_id = $1 ORDER BY numero ASC`,
      [mangaId]
    );

    // Para cada capítulo, buscar páginas
    const capitulos = [];
    for (const capitulo of capitulosResult.rows) {
      const paginasResult = await client.query(
        `SELECT * FROM paginas WHERE capitulo_id = $1 ORDER BY numero ASC`,
        [capitulo.id]
      );

      capitulos.push({
        ...capitulo,
        paginas: paginasResult.rows,
      });
    }

    const manga = {
      ...mangaResult.rows[0],
      capitulos,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Deletar páginas
      await client.query(
        `DELETE FROM paginas 
         WHERE capitulo_id IN (SELECT id FROM capitulos WHERE manga_id = $1)`,
        [mangaId]
      );

      // Deletar capítulos
      await client.query(`DELETE FROM capitulos WHERE manga_id = $1`, [mangaId]);

      // Deletar mangá
      const result = await client.query(`DELETE FROM mangas WHERE id = $1`, [mangaId]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        message: 'Mangá deletado com sucesso!',
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
