import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// POST - Teste simples para criar mangá
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, autor, generos, status } = body;

    if (!titulo) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Inserir mangá simples (sem capa e capítulos por enquanto)
      const mangaResult = await client.query(`
        INSERT INTO mangas (titulo, autor, generos, status, capa)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [titulo, autor || null, generos || [], status || 'em_andamento', 'teste.jpg']);

      const mangaId = mangaResult.rows[0].id;
      
      return NextResponse.json({ 
        success: true, 
        mangaId,
        message: 'Mangá de teste criado com sucesso!' 
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao criar mangá de teste:', error);
    return NextResponse.json({ error: 'Erro interno do servidor: ' + (error as Error).message }, { status: 500 });
  }
}
