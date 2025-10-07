import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';

// Configurações para uploads grandes
export const runtime = 'nodejs';
export const maxDuration = 120;

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

// POST - Adicionar novo capítulo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const tokenResult = verifyToken(request);
    if (!tokenResult.success) {
      return NextResponse.json({ error: tokenResult.error }, { status: 401 });
    }

    console.log('🔍 API - Iniciando criação de capítulo');
    
    const { id } = await params;
    const mangaId = parseInt(id);
    const body = await request.json();
    const { numero, titulo, paginas, editado_por, editado_em } = body;
    
    console.log('📥 API - Dados recebidos:', {
      mangaId,
      numero,
      titulo,
      paginasCount: paginas?.length,
      editado_por,
      editado_em
    });

    if (isNaN(mangaId)) {
      console.log('❌ API - ID do mangá inválido');
      return NextResponse.json({ error: 'ID do mangá inválido' }, { status: 400 });
    }

    if (!numero || !titulo || !paginas || paginas.length === 0) {
      console.log('❌ API - Dados obrigatórios não fornecidos:', {
        numero: !!numero,
        titulo: !!titulo,
        paginas: !!paginas,
        paginasLength: paginas?.length
      });
      return NextResponse.json({ 
        error: 'Dados obrigatórios não fornecidos',
        details: {
          numero: numero || 'não fornecido',
          titulo: titulo || 'não fornecido',
          paginas: paginas?.length || 0
        }
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Debug log removido por segurança
      await client.query('BEGIN');

      // Verificar se o mangá existe
      // Debug log removido por segurança
      const mangaResult = await client.query(
        `SELECT id FROM mangas WHERE id = $1`,
        [mangaId]
      );

      if (mangaResult.rows.length === 0) {
        console.log('❌ API - Mangá não encontrado');
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      // Verificar se já existe um capítulo com esse número
      // Debug log removido por segurança
      const capituloExistente = await client.query(
        `SELECT id FROM capitulos WHERE manga_id = $1 AND numero = $2`,
        [mangaId, numero]
      );

      if (capituloExistente.rows.length > 0) {
        console.log('❌ API - Capítulo já existe');
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Já existe um capítulo com esse número' }, { status: 400 });
      }

      // Gerar timestamp único para evitar conflitos de nome
      const timestamp = Date.now();
      console.log('⏰ API - Timestamp gerado:', timestamp);

      // Inserir capítulo
      // Debug log removido por segurança
      const capituloResult = await client.query(`
        INSERT INTO capitulos (manga_id, numero, titulo, data_publicacao, editado_por, updated_at)
        VALUES ($1, $2, $3, NOW(), $4, $5)
        RETURNING id
      `, [mangaId, numero, titulo, editado_por, editado_em]);

      const capituloId = capituloResult.rows[0].id;
      console.log('✅ API - Capítulo inserido com ID:', capituloId);

      // Salvar páginas do capítulo na ordem correta
      console.log('📄 API - Salvando páginas:', paginas.length);
      for (let i = 0; i < paginas.length; i++) {
        const pagina = paginas[i];
        // Debug log removido por segurança
        
        const extensaoPagina = pagina.preview.includes('data:image/png') ? 'png' : 'jpg';
        const nomePagina = `pagina_${capituloId}_${i + 1}_${timestamp}.${extensaoPagina}`;
        
        // Debug log removido por segurança
        const urlPagina = await salvarImagem(pagina.preview, nomePagina, `capitulos/${capituloId}`);
        
        // Debug log removido por segurança
        await client.query(`
          INSERT INTO paginas (capitulo_id, numero, imagem, legenda, editado_por, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [capituloId, i + 1, urlPagina, pagina.legenda || `Página ${i + 1}`, editado_por, editado_em]);
      }

      console.log('✅ API - Commitando transação');
      await client.query('COMMIT');
      
      console.log('🎉 API - Capítulo criado com sucesso!');
      return NextResponse.json({ 
        success: true, 
        capituloId,
        message: 'Capítulo adicionado com sucesso!' 
      });

    } catch (error) {
      console.error('❌ API - Erro na transação:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ API - Erro geral ao adicionar capítulo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
