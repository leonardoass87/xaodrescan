import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import emailService from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validações básicas
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
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

    // Verificar se o usuário existe
    const userResult = await pool.query(
      'SELECT id, nome, email FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Por segurança, retornamos sucesso mesmo se o email não existir
      return NextResponse.json(
        { 
          message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.',
          success: true 
        },
        { status: 200 }
      );
    }

    const user = userResult.rows[0];

    // Gerar token de reset
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salvar token no banco
    await pool.query(
      'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    );

    // Enviar email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email, 
      resetToken, 
      user.nome
    );

    if (!emailSent) {
      // Se falhou ao enviar email, limpar o token
      await pool.query(
        'UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
        [user.id]
      );
      
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
