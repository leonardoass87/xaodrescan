import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// POST - Incrementar visualizações de um mangá
export async function POST(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { id } = params as { id: string };
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      // Verificar se o mangá existe
      const mangaResult = await client.query(
        `SELECT id, visualizacoes FROM mangas WHERE id = $1`,
        [mangaId]
      );

      if (mangaResult.rows.length === 0) {
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      // Incrementar visualizações
      const result = await client.query(
        `UPDATE mangas SET visualizacoes = visualizacoes + 1 WHERE id = $1 RETURNING visualizacoes`,
        [mangaId]
      );

      const novasVisualizacoes = result.rows[0].visualizacoes;

      return NextResponse.json({
        success: true,
        visualizacoes: novasVisualizacoes,
        message: 'Visualização contabilizada com sucesso!'
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// GET - Obter número atual de visualizações
export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { id } = params as { id: string };
    const mangaId = parseInt(id);

    if (isNaN(mangaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT visualizacoes FROM mangas WHERE id = $1`,
        [mangaId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Mangá não encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        visualizacoes: result.rows[0].visualizacoes
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao buscar visualizações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
