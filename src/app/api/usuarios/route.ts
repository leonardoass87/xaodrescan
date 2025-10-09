import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Dados mockados temporariamente para testar
    const usuarios = [
      {
        id: 1,
        nome: "leonardo",
        email: "leoalvesjf@gmail.com",
        role: "ADMIN",
        created_at: "2025-10-08T19:08:08.857Z",
        dataCriacao: "2025-10-08T19:08:08.857Z"
      }
    ];

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
