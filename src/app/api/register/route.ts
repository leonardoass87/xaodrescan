import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import emailService from '@/services/emailService';

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

    // Gerar token de confirmação de email
    const confirmationToken = randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Inserir usuário (sem confirmação inicial)
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, role, email_confirmado, email_confirmation_token, email_confirmation_expires, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING id, nome, email, role, created_at`,
      [nome, email, hashedPassword, 'usuario', false, confirmationToken, confirmationExpires]
    );

    const newUser = result.rows[0];

    // Enviar email de confirmação
    const emailSent = await emailService.sendEmailConfirmation(
      newUser.email,
      newUser.nome,
      confirmationToken
    );

    if (!emailSent) {
      // Se falhou ao enviar email, limpar o token
      await pool.query(
        'UPDATE usuarios SET email_confirmation_token = NULL, email_confirmation_expires = NULL WHERE id = $1',
        [newUser.id]
      );

      return NextResponse.json(
        { error: 'Erro ao enviar email de confirmação. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    // 🔑 Gerar token JWT (sem confirmação de email)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, userId: newUser.id },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" }
    );

    // Retornar resposta sem token (usuário precisa confirmar email)
    return NextResponse.json(
      {
        message: 'Usuário registrado com sucesso! Verifique seu email para confirmar a conta.',
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          role: newUser.role,
          email_confirmado: false,
          created_at: newUser.created_at
        },
        requiresEmailConfirmation: true,
        token // Token temporário para acessar página de confirmação
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
