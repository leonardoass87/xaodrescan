import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json();

    // Validações
    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Verificar se já existe
    const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Inserir usuário
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, role, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, nome, email, role, created_at`,
      [nome, email, hashedPassword, 'usuario']
    );

    const newUser = result.rows[0];

    // 🔑 Gerar token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "dev-secret", // ⚠️ use uma secret forte em produção
      { expiresIn: "1h" }
    );

    // Retornar token + user
    return NextResponse.json(
      {
        message: 'Usuário registrado com sucesso',
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at
        },
        token
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
