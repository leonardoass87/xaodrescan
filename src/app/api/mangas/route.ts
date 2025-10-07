import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir, chmod, unlink } from 'fs/promises';
import path from 'path';

// Configurações para uploads grandes
// ECONNRESET acontece quando:
// 1. Corpo da requisição muito grande (base64 é ~33% maior que arquivo original)
// 2. Tempo de processamento excedido (Edge Runtime tem timeout de 30s)
// 3. Memória insuficiente para processar payload grande
export const runtime = 'nodejs'; // Usa Node.js runtime (sem timeout de 30s)
export const maxDuration = 120; // 2 minutos para processar uploads grandes

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para salvar imagem (base64 ou File) em arquivo
async function salvarImagem(imageData: string | File, nomeArquivo: string, subpasta: string = '') {
  try {
    let buffer: Buffer;
    
    if (typeof imageData === 'string') {
      // Modo base64 (compatibilidade com sistema atual)
      const base64 = imageData.split(',')[1];
      buffer = Buffer.from(base64, 'base64');
    } else {
      // Modo File (FormData)
      const arrayBuffer = await imageData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    
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
    const contentType = request.headers.get('content-type') || '';
    
    let body: any;
    let isFormData = false;
    
    // Detectar se é FormData ou JSON
    if (contentType.includes('multipart/form-data')) {
      isFormData = true;
      const formData = await request.formData();
      
      // Extrair dados do FormData
      body = {
        titulo: formData.get('titulo') as string,
        autor: formData.get('autor') as string,
        generos: formData.get('generos') as string,
        status: formData.get('status') as string,
        capa: formData.get('capa') as File,
        capitulo: {
          numero: parseInt(formData.get('capitulo.numero') as string),
          titulo: formData.get('capitulo.titulo') as string,
          paginas: Array.from(formData.getAll('capitulo.paginas')) as File[]
        }
      };
    } else {
      // Modo JSON (compatibilidade com sistema atual)
      body = await request.json();
    }
    
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
      let extensaoCapa: string;
      if (typeof capa === 'string') {
        // Modo base64
        extensaoCapa = capa.includes('data:image/png') ? 'png' : 'jpg';
      } else {
        // Modo File
        extensaoCapa = capa.name.split('.').pop() || 'jpg';
      }
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
        let extensaoPagina: string;
        let imagemData: string | File;
        
        if (typeof pagina === 'string') {
          // Modo base64 (compatibilidade)
          extensaoPagina = pagina.includes('data:image/png') ? 'png' : 'jpg';
          imagemData = pagina;
        } else {
          // Modo File (FormData)
          extensaoPagina = pagina.name.split('.').pop() || 'jpg';
          imagemData = pagina;
        }
        
        const nomePagina = `pagina_${capituloId}_${i + 1}_${timestamp}.${extensaoPagina}`;
        const urlPagina = await salvarImagem(imagemData, nomePagina, `capitulos/${capituloId}`);
        
        await client.query(`
          INSERT INTO paginas (capitulo_id, numero, imagem, legenda)
          VALUES ($1, $2, $3, $4)
        `, [capituloId, i + 1, urlPagina, `Página ${i + 1}`]);
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
