import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para salvar imagem base64 em arquivo
async function salvarImagem(base64Data: string, nomeArquivo: string, subpasta: string = '') {
  try {
    // Remover o prefixo data:image/...;base64,
    const base64 = base64Data.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    
    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), 'uploads', subpasta);
    await mkdir(uploadsDir, { recursive: true });
    
    // Salvar arquivo
    const caminhoArquivo = path.join(uploadsDir, nomeArquivo);
    await writeFile(caminhoArquivo, buffer);
    
    // Retornar URL relativa com /uploads/
    const url = `/uploads/${subpasta}${subpasta ? '/' : ''}${nomeArquivo}`;
    return url;
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    throw error;
  }
}

// GET - Listar todos os mangás
export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        m.*,
        COUNT(c.id) as total_capitulos
      FROM mangas m
      LEFT JOIN capitulos c ON m.id = c.manga_id
      GROUP BY m.id
      ORDER BY m.id ASC
    `);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar mangás:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo mangá
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, autor, generos, status, capa, capitulo } = body;

    if (!titulo || !capa || !capitulo?.paginas || capitulo.paginas.length === 0) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Gerar timestamp único para evitar conflitos de nome
      const timestamp = Date.now();
      
      // Salvar capa do mangá
      const extensaoCapa = capa.includes('data:image/png') ? 'png' : 'jpg';
      const nomeCapa = `capa_${timestamp}.${extensaoCapa}`;
      const urlCapa = await salvarImagem(capa, nomeCapa, 'capas');

      // Inserir mangá
      const mangaResult = await client.query(`
        INSERT INTO mangas (titulo, autor, generos, status, capa)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [titulo, autor || null, generos || [], status || 'em_andamento', urlCapa]);

      const mangaId = mangaResult.rows[0].id;

      // Inserir capítulo
      const capituloResult = await client.query(`
        INSERT INTO capitulos (manga_id, numero, titulo, data_publicacao)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `, [mangaId, capitulo.numero, capitulo.titulo || `Capítulo ${capitulo.numero}`]);

      const capituloId = capituloResult.rows[0].id;

      // Salvar páginas do capítulo na ordem correta
      for (let i = 0; i < capitulo.paginas.length; i++) {
        const pagina = capitulo.paginas[i];
        const extensaoPagina = pagina.preview.includes('data:image/png') ? 'png' : 'jpg';
        const nomePagina = `pagina_${capituloId}_${i + 1}_${timestamp}.${extensaoPagina}`;
        const urlPagina = await salvarImagem(pagina.preview, nomePagina, `capitulos/${capituloId}`);
        
        await client.query(`
          INSERT INTO paginas (capitulo_id, numero, imagem, legenda)
          VALUES ($1, $2, $3, $4)
        `, [capituloId, i + 1, urlPagina, pagina.legenda || `Página ${i + 1}`]);
      }

      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        mangaId,
        message: 'Mangá criado com sucesso!' 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao criar mangá:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
