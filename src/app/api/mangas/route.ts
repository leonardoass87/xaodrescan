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
      // Verificação de segurança para split
      if (!imageData || typeof imageData !== 'string') {
        throw new Error('Dados de imagem inválidos');
      }
      
      const base64Parts = imageData.split(',');
      if (base64Parts.length < 2) {
        throw new Error('Formato de base64 inválido - prefixo data:image não encontrado');
      }
      
      const base64 = base64Parts[1];
      if (!base64) {
        throw new Error('Dados base64 vazios');
      }
      
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

// GET - Listar todos os mangás ou buscar estatísticas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats');
    
    if (stats === 'true') {
      // Retornar estatísticas do dashboard
      const client = await pool.connect();
      
      const [
        usuariosResult,
        mangasResult,
        capitulosResult,
        visualizacoesResult,
        usuariosRecentesResult,
        mangasRecentesResult,
        capitulosRecentesResult,
        // Dados do período anterior para cálculo de crescimento
        usuariosAnterioresResult,
        mangasAnterioresResult,
        capitulosAnterioresResult,
        visualizacoesAnterioresResult
      ] = await Promise.all([
        // Total de usuários
        client.query('SELECT COUNT(*) as total FROM usuarios'),
        
        // Total de mangás
        client.query('SELECT COUNT(*) as total FROM mangas'),
        
        // Total de capítulos
        client.query('SELECT COUNT(*) as total FROM capitulos'),
        
        // Total de visualizações
        client.query('SELECT SUM(visualizacoes) as total FROM mangas'),
        
        // Usuários recentes (últimos 7 dias)
        client.query(`
          SELECT nome, email, created_at 
          FROM usuarios 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          ORDER BY created_at DESC 
          LIMIT 5
        `),
        
        // Mangás recentes (últimos 7 dias)
        client.query(`
          SELECT titulo, data_adicao, autor
          FROM mangas 
          WHERE data_adicao >= NOW() - INTERVAL '7 days'
          ORDER BY data_adicao DESC 
          LIMIT 5
        `),
        
        // Capítulos recentes (últimos 7 dias)
        client.query(`
          SELECT c.numero, c.titulo, c.data_publicacao, m.titulo as manga_titulo
          FROM capitulos c
          JOIN mangas m ON c.manga_id = m.id
          WHERE c.data_publicacao >= NOW() - INTERVAL '7 days'
          ORDER BY c.data_publicacao DESC 
          LIMIT 5
        `),
        
        // Novos registros do período anterior (7-14 dias atrás) para comparação
        client.query(`
          SELECT COUNT(*) as total 
          FROM usuarios 
          WHERE created_at >= NOW() - INTERVAL '14 days' 
          AND created_at < NOW() - INTERVAL '7 days'
        `),
        
        client.query(`
          SELECT COUNT(*) as total 
          FROM mangas 
          WHERE data_adicao >= NOW() - INTERVAL '14 days' 
          AND data_adicao < NOW() - INTERVAL '7 days'
        `),
        
        client.query(`
          SELECT COUNT(*) as total 
          FROM capitulos 
          WHERE data_publicacao >= NOW() - INTERVAL '14 days' 
          AND data_publicacao < NOW() - INTERVAL '7 days'
        `),
        
        client.query(`
          SELECT COUNT(*) as total 
          FROM mangas 
          WHERE updated_at >= NOW() - INTERVAL '14 days' 
          AND updated_at < NOW() - INTERVAL '7 days'
        `)
      ]);
      
      client.release();
      
      // Função para calcular porcentagem de crescimento baseada em novos registros
      const calcularCrescimento = (novosAtual: number, novosAnterior: number): number => {
        if (novosAnterior === 0) {
          return novosAtual > 0 ? 100 : 0; // Se não havia novos registros antes, crescimento é 100% ou 0%
        }
        return Math.round(((novosAtual - novosAnterior) / novosAnterior) * 100);
      };
      
      // Extrair totais atuais (para exibição)
      const usuariosTotal = parseInt(usuariosResult.rows[0].total);
      const mangasTotal = parseInt(mangasResult.rows[0].total);
      const capitulosTotal = parseInt(capitulosResult.rows[0].total);
      const visualizacoesTotal = parseInt(visualizacoesResult.rows[0].total) || 0;
      
      // Extrair novos registros dos últimos 7 dias (para cálculo de crescimento)
      const usuariosNovos = usuariosRecentesResult.rows.length;
      const mangasNovos = mangasRecentesResult.rows.length;
      const capitulosNovos = capitulosRecentesResult.rows.length;
      
      // Extrair novos registros do período anterior (7-14 dias atrás)
      const usuariosNovosAnterior = parseInt(usuariosAnterioresResult.rows[0].total) || 0;
      const mangasNovosAnterior = parseInt(mangasAnterioresResult.rows[0].total) || 0;
      const capitulosNovosAnterior = parseInt(capitulosAnterioresResult.rows[0].total) || 0;
      const visualizacoesNovosAnterior = parseInt(visualizacoesAnterioresResult.rows[0].total) || 0;
      
      // Calcular percentuais reais baseados em novos registros
      // Exemplo: Se esta semana teve 3 novos usuários e semana passada teve 1 = +200%
      const statsData = {
        usuarios: {
          total: usuariosTotal, // Total geral de usuários
          crescimento: calcularCrescimento(usuariosNovos, usuariosNovosAnterior) // Crescimento baseado em novos registros
        },
        mangas: {
          total: mangasTotal,
          crescimento: calcularCrescimento(mangasNovos, mangasNovosAnterior)
        },
        capitulos: {
          total: capitulosTotal,
          crescimento: calcularCrescimento(capitulosNovos, capitulosNovosAnterior)
        },
        visualizacoes: {
          total: visualizacoesTotal,
          crescimento: calcularCrescimento(visualizacoesTotal, visualizacoesNovosAnterior)
        },
        atividades: {
          usuariosRecentes: usuariosRecentesResult.rows,
          mangasRecentes: mangasRecentesResult.rows,
          capitulosRecentes: capitulosRecentesResult.rows
        }
      };
      
      return NextResponse.json(statsData);
    }
    
    // Comportamento padrão - listar mangás
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
    console.error('Erro ao buscar dados:', error);
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
      
      // 🔍 LOG: Verificar dados recebidos do frontend
      console.log('📥 Dados recebidos do FormData:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }
      
      // Validações de segurança para campos obrigatórios
      const titulo = formData.get('titulo') as string;
      const autor = formData.get('autor') as string;
      const generos = formData.get('generos') as string;
      const description = formData.get('description') as string;
      const status = formData.get('status') as string;
      const capa = formData.get('capa') as File;
      const capituloNumero = formData.get('capitulo.numero') as string;
      const capituloTitulo = formData.get('capitulo.titulo') as string;
      const paginas = Array.from(formData.getAll('capitulo.paginas')) as File[];
      
      // Verificar campos obrigatórios
      if (!titulo) {
        return NextResponse.json({ error: "Campo 'titulo' ausente na requisição" }, { status: 400 });
      }
      if (!capa) {
        return NextResponse.json({ error: "Campo 'capa' ausente na requisição" }, { status: 400 });
      }
      if (!capituloNumero) {
        return NextResponse.json({ error: "Campo 'capitulo.numero' ausente na requisição" }, { status: 400 });
      }
      if (!paginas || paginas.length === 0) {
        return NextResponse.json({ error: "Campo 'capitulo.paginas' ausente ou vazio na requisição" }, { status: 400 });
      }
      
      // Validar número do capítulo
      const capituloNumeroInt = parseInt(capituloNumero);
      if (isNaN(capituloNumeroInt)) {
        return NextResponse.json({ error: "Número do capítulo deve ser um número válido" }, { status: 400 });
      }
      
      // Extrair dados do FormData com verificações de segurança
      body = {
        titulo,
        autor: autor || null,
        generos: generos || "",
        description: description || null,
        status: status || 'EM_ANDAMENTO',
        capa,
        capitulo: {
          numero: capituloNumeroInt,
          titulo: capituloTitulo || `Capítulo ${capituloNumero}`,
          paginas
        }
      };
    } else {
      // Modo JSON (compatibilidade com sistema atual)
      body = await request.json();
      
      // 🔍 LOG: Verificar dados recebidos do JSON
      console.log('📥 Dados recebidos do JSON:', {
        titulo: body.titulo,
        autor: body.autor,
        generos: body.generos,
        description: body.description,
        status: body.status,
        capa: body.capa ? '[Base64 Image]' : 'null',
        capitulo: {
          numero: body.capitulo?.numero,
          titulo: body.capitulo?.titulo,
          paginas: body.capitulo?.paginas?.length || 0
        }
      });
    }
    
    const { titulo, autor, generos, description, status, capa, capitulo } = body;

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
        // Modo File - Verificação de segurança para split
        if (!capa || !capa.name) {
          throw new Error('Nome do arquivo de capa inválido');
        }
        
        const nameParts = capa.name.split('.');
        extensaoCapa = nameParts.length > 1 ? nameParts.pop() || 'jpg' : 'jpg';
      }
      const nomeCapa = `capa_${timestamp}.${extensaoCapa}`;
      const urlCapa = await salvarImagem(capa, nomeCapa, 'capas');

      // Processar gêneros com verificação de segurança
      let listaGeneros: string[] = [];
      if (generos) {
        if (typeof generos === 'string') {
          // Se for string, dividir por vírgula
          listaGeneros = generos.trim() ? generos.split(',').map(g => g.trim()).filter(g => g.length > 0) : [];
        } else if (Array.isArray(generos)) {
          // Se já for array, usar diretamente
          listaGeneros = generos.filter(g => g && typeof g === 'string' && g.trim().length > 0);
        }
      }
      
      console.log('📝 Gêneros processados:', listaGeneros);
      
      // Inserir mangá
      const mangaResult = await client.query(`
        INSERT INTO mangas (titulo, autor, generos, description, status, capa, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `, [titulo, autor || null, listaGeneros, description || null, status || 'EM_ANDAMENTO', urlCapa]);

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
          // Modo File (FormData) - Verificação de segurança para split
          if (!pagina || !pagina.name) {
            throw new Error(`Nome do arquivo da página ${i + 1} inválido`);
          }
          
          const nameParts = pagina.name.split('.');
          extensaoPagina = nameParts.length > 1 ? nameParts.pop() || 'jpg' : 'jpg';
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

  } catch (error: any) {
    console.error('❌ Erro ao criar mangá:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Retornar erro específico baseado no tipo de erro
    if (error.message.includes('Dados de imagem inválidos')) {
      return NextResponse.json({ error: 'Dados de imagem inválidos' }, { status: 400 });
    }
    if (error.message.includes('Formato de base64 inválido')) {
      return NextResponse.json({ error: 'Formato de imagem inválido' }, { status: 400 });
    }
    if (error.message.includes('Nome do arquivo')) {
      return NextResponse.json({ error: 'Nome de arquivo inválido' }, { status: 400 });
    }
    if (error.message.includes('Campo')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
