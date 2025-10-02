import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json();

    // Validações básicas
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validação de senha
    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário no banco
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, nome, email, role, created_at',
      [nome, email, hashedPassword, 'usuario']
    );

    const newUser = result.rows[0];

    return NextResponse.json(
      {
        message: 'Usuário registrado com sucesso',
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          created_at: newUser.created_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Verificar se é erro de tabela não existente
    if (error instanceof Error && error.message.includes('relation "usuarios" does not exist')) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado. Execute as migrations primeiro.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}