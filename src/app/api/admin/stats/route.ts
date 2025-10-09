import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Buscar estatísticas gerais
    const [
      usuariosResult,
      mangasResult,
      capitulosResult,
      visualizacoesResult,
      usuariosRecentesResult,
      mangasRecentesResult,
      capitulosRecentesResult
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
      `)
    ]);
    
    client.release();
    
    // Calcular percentuais de crescimento (simulado por enquanto)
    const stats = {
      usuarios: {
        total: parseInt(usuariosResult.rows[0].total),
        crescimento: 12 // Simulado - pode ser calculado comparando com período anterior
      },
      mangas: {
        total: parseInt(mangasResult.rows[0].total),
        crescimento: 8
      },
      capitulos: {
        total: parseInt(capitulosResult.rows[0].total),
        crescimento: 15
      },
      visualizacoes: {
        total: parseInt(visualizacoesResult.rows[0].total) || 0,
        crescimento: 23
      },
      atividades: {
        usuariosRecentes: usuariosRecentesResult.rows,
        mangasRecentes: mangasRecentesResult.rows,
        capitulosRecentes: capitulosRecentesResult.rows
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
