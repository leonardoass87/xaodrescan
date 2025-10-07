import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';

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

// POST - Adicionar páginas a um capítulo existente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; capituloId: string }> }
) {
  try {
    // Verificar autenticação
    const tokenResult = verifyToken(request);
    if (!tokenResult.success) {
      return NextResponse.json({ error: tokenResult.error }, { status: 401 });
    }

    console.log('🔍 API - Iniciando adição de páginas ao capítulo');
    
    const { id, capituloId } = await params;
    const mangaId = parseInt(id);
    const capId = parseInt(capituloId);
    const body = await request.json();
    const { paginas, editado_por, editado_em } = body;
    
    console.log('📥 API - Dados recebidos:', {
      mangaId,
      capituloId: capId,
      paginasCount: paginas?.length,
      editado_por,
      editado_em
    });

    if (isNaN(mangaId) || isNaN(capId)) {
      console.log('❌ API - IDs inválidos');
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    if (!paginas || paginas.length === 0) {
      console.log('❌ API - Nenhuma página fornecida');
      return NextResponse.json({ 
        error: 'Nenhuma página fornecida',
        details: { paginas: paginas?.length || 0 }
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

      // Verificar se o capítulo existe
      // Debug log removido por segurança
      const capituloResult = await client.query(
        `SELECT id, numero FROM capitulos WHERE id = $1 AND manga_id = $2`,
        [capId, mangaId]
      );

      if (capituloResult.rows.length === 0) {
        console.log('❌ API - Capítulo não encontrado');
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Capítulo não encontrado' }, { status: 404 });
      }

      // Buscar o próximo número de página
      console.log('🔍 API - Buscando próximo número de página');
      const ultimaPaginaResult = await client.query(
        `SELECT MAX(numero) as max_numero FROM paginas WHERE capitulo_id = $1`,
        [capId]
      );

      const proximoNumero = (ultimaPaginaResult.rows[0].max_numero || 0) + 1;
      console.log('📄 API - Próximo número de página:', proximoNumero);

      // Gerar timestamp único para evitar conflitos de nome
      const timestamp = Date.now();
      console.log('⏰ API - Timestamp gerado:', timestamp);

      // Salvar novas páginas
      console.log('📄 API - Salvando novas páginas:', paginas.length);
      for (let i = 0; i < paginas.length; i++) {
        const pagina = paginas[i];
        const numeroPagina = proximoNumero + i;
        // Debug log removido por segurança
        
        const extensaoPagina = pagina.preview.includes('data:image/png') ? 'png' : 'jpg';
        const nomePagina = `pagina_${capId}_${numeroPagina}_${timestamp}.${extensaoPagina}`;
        
        // Debug log removido por segurança
        const urlPagina = await salvarImagem(pagina.preview, nomePagina, `capitulos/${capId}`);
        
        // Debug log removido por segurança
        await client.query(`
          INSERT INTO paginas (capitulo_id, numero, imagem, legenda, editado_por, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [capId, numeroPagina, urlPagina, pagina.legenda || `Página ${numeroPagina}`, editado_por, editado_em]);
      }

      console.log('✅ API - Commitando transação');
      await client.query('COMMIT');
      
      console.log('🎉 API - Páginas adicionadas com sucesso!');
      return NextResponse.json({ 
        success: true, 
        paginasAdicionadas: paginas.length,
        proximoNumero,
        message: `${paginas.length} página(s) adicionada(s) com sucesso!` 
      });

    } catch (error) {
      console.error('❌ API - Erro na transação:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ API - Erro geral ao adicionar páginas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
