import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir, chmod, unlink } from 'fs/promises';
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
    
    // Usar diretório temporário primeiro
    const tempDir = path.join(process.cwd(), 'temp');
    await mkdir(tempDir, { recursive: true, mode: 0o777 });
    
    // Salvar arquivo temporário
    const tempFile = path.join(tempDir, nomeArquivo);
    await writeFile(tempFile, buffer);
    
    // Criar diretório de destino com nome único para evitar conflitos
    const uniqueDir = `${subpasta}_${Date.now()}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', uniqueDir);
    await mkdir(uploadsDir, { recursive: true, mode: 0o777 });
    
    // Salvar arquivo no diretório único
    const caminhoArquivo = path.join(uploadsDir, nomeArquivo);
    await writeFile(caminhoArquivo, buffer);
    
    // Limpar arquivo temporário
    try {
      await unlink(tempFile);
    } catch (error) {
      console.log('Não foi possível remover arquivo temporário:', error);
    }
    
    // Retornar URL relativa com /uploads/
    const url = `/uploads/${uniqueDir}/${nomeArquivo}`;
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
        INSERT INTO mangas (titulo, autor, generos, status, capa, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [titulo, autor || null, generos || [], status || 'EM_ANDAMENTO', urlCapa]);

      const mangaId = mangaResult.rows[0].id;

      // Inserir capítulo
      const capituloResult = await client.query(`
        INSERT INTO capitulos (manga_id, numero, titulo, data_publicacao, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
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
