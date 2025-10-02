import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT id, nome, email, role, status, data_criacao
      FROM usuarios
      ORDER BY id ASC
    `);

    client.release();

    return NextResponse.json(
      result.rows.map((u) => ({
        ...u,
        dataCriacao: u.data_criacao, // ajusta campo snake_case → camelCase
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
