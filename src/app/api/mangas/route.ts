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
      
      // Extrair dados do FormData com verificações de segurança
      body = {
        titulo,
        autor: autor || null,
        generos: generos || "",
        status: status || 'EM_ANDAMENTO',
        capa,
        capitulo: {
          numero: parseInt(capituloNumero),
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
        status: body.status,
        capa: body.capa ? '[Base64 Image]' : 'null',
        capitulo: {
          numero: body.capitulo?.numero,
          titulo: body.capitulo?.titulo,
          paginas: body.capitulo?.paginas?.length || 0
        }
      });
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
        INSERT INTO mangas (titulo, autor, generos, status, capa, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [titulo, autor || null, listaGeneros, status || 'EM_ANDAMENTO', urlCapa]);

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
