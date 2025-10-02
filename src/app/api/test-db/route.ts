import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Testar conexão simples
    const result = await client.query('SELECT NOW() as current_time');
    
    client.release();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conexão com banco OK',
      time: result.rows[0].current_time,
      databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
    });
    
  } catch (error) {
    console.error('Erro na conexão com banco:', error);
    return NextResponse.json({ 
      error: 'Erro na conexão com banco: ' + (error as Error).message,
      databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
    }, { status: 500 });
  }
}
