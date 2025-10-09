import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar usuários reais do banco de dados
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        created_at: true,
        email_confirmado: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Mapear dados para o formato esperado pelo frontend
    const usuariosFormatados = usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      created_at: usuario.created_at.toISOString(),
      dataCriacao: usuario.created_at.toISOString(),
      email_confirmado: usuario.email_confirmado
    }));

    return NextResponse.json(usuariosFormatados);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
