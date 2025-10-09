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
    // Validar se base64Data existe e não está vazio
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Dados base64 inválidos: dados não fornecidos ou não são string');
    }

    // Verificar se contém o prefixo data:image
    if (!base64Data.includes('data:image')) {
      throw new Error('Dados base64 inválidos: não contém prefixo data:image');
    }

    // Verificar se contém vírgula para separar o prefixo
    if (!base64Data.includes(',')) {
      throw new Error('Dados base64 inválidos: formato incorreto, não contém vírgula separadora');
    }

    // Remover o prefixo data:image/...;base64,
    const base64 = base64Data.split(',')[1];
    
    // Validar se o base64 foi extraído corretamente
    if (!base64 || base64.trim() === '') {
      throw new Error('Dados base64 inválidos: não foi possível extrair os dados após a vírgula');
    }

    console.log('🔍 Debug - Base64 extraído com sucesso, tamanho:', base64.length);
    const buffer = Buffer.from(base64, 'base64');
    
    // Criar diretório se não existir com permissões adequadas
    const uploadsDir = path.join(process.cwd(), 'uploads', subpasta);
    console.log('🔍 Debug - Tentando criar diretório:', uploadsDir);
    
    // Garantir que todos os diretórios pais existem
    const uploadsBaseDir = path.join(process.cwd(), 'uploads');
    const capitulosDir = path.join(process.cwd(), 'uploads', 'capitulos');
    
    // Criar diretórios em sequência para garantir que existam
    const dirsToCreate = [uploadsBaseDir, capitulosDir, uploadsDir];
    
    for (const dir of dirsToCreate) {
      try {
        await mkdir(dir, { recursive: true, mode: 0o777 });
        console.log('✅ Debug - Diretório criado/verificado:', dir);
      } catch (error) {
        console.warn('⚠️ Debug - Erro ao criar diretório:', dir, error);
        // Continuar mesmo se falhar, o mkdir final pode funcionar
      }
    }
    
    try {
      await mkdir(uploadsDir, { 
        recursive: true,
        mode: 0o755 // Permissões de leitura/escrita/execução para owner e grupo
      });
      console.log('✅ Debug - Diretório criado com sucesso (755):', uploadsDir);
    } catch (mkdirError) {
      console.warn('❌ Debug - Erro ao criar diretório com permissões 755, tentando 777:', mkdirError);
      // Tentar com permissões mais permissivas
      await mkdir(uploadsDir, { 
        recursive: true,
        mode: 0o777 // Permissões mais permissivas
      });
      console.log('✅ Debug - Diretório criado com sucesso (777):', uploadsDir);
    }
    
    // Salvar arquivo com permissões adequadas
    const caminhoArquivo = path.join(uploadsDir, nomeArquivo);
    console.log('🔍 Debug - Tentando salvar arquivo:', caminhoArquivo);
    
    try {
      await writeFile(caminhoArquivo, buffer, { mode: 0o644 }); // Permissões de leitura/escrita para owner, leitura para outros
      console.log('✅ Debug - Arquivo salvo com sucesso (644):', caminhoArquivo);
    } catch (writeError) {
      console.warn('❌ Debug - Erro ao salvar com permissões 644, tentando 666:', writeError);
      // Tentar com permissões mais permissivas
      await writeFile(caminhoArquivo, buffer, { mode: 0o666 }); // Permissões mais permissivas
      console.log('✅ Debug - Arquivo salvo com sucesso (666):', caminhoArquivo);
    }
    
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
    const { numero, titulo, paginas } = body;
    
    console.log('📥 API - Dados recebidos:', {
      mangaId,
      numero,
      titulo,
      paginasCount: paginas?.length
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
        INSERT INTO capitulos (manga_id, numero, titulo, data_publicacao, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id
      `, [mangaId, numero, titulo]);

      const capituloId = capituloResult.rows[0].id;
      console.log('✅ API - Capítulo inserido com ID:', capituloId);

      // Salvar páginas do capítulo na ordem correta
      console.log('📄 API - Salvando páginas:', paginas.length);
      for (let i = 0; i < paginas.length; i++) {
        const pagina = paginas[i];
        
        // Validar se a página tem dados válidos
        if (!pagina || !pagina.preview) {
          console.error(`❌ API - Página ${i + 1} inválida:`, pagina);
          throw new Error(`Página ${i + 1} não possui dados de preview válidos`);
        }

        // Validar se o preview é uma string válida
        if (typeof pagina.preview !== 'string' || pagina.preview.trim() === '') {
          console.error(`❌ API - Preview da página ${i + 1} inválido:`, typeof pagina.preview, pagina.preview?.length);
          throw new Error(`Página ${i + 1} não possui preview válido`);
        }
        
        console.log(`🔍 API - Processando página ${i + 1}, tamanho do preview:`, pagina.preview.length);
        
        const extensaoPagina = pagina.preview.includes('data:image/png') ? 'png' : 'jpg';
        const nomePagina = `pagina_${capituloId}_${i + 1}_${timestamp}.${extensaoPagina}`;
        
        console.log(`🔍 API - Salvando página ${i + 1} como:`, nomePagina);
        const urlPagina = await salvarImagem(pagina.preview, nomePagina, `capitulos/${capituloId}`);
        
        // Debug log removido por segurança
        await client.query(`
          INSERT INTO paginas (capitulo_id, numero, imagem, legenda)
          VALUES ($1, $2, $3, $4)
        `, [capituloId, i + 1, urlPagina, pagina.legenda || `Página ${i + 1}`]);
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
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
