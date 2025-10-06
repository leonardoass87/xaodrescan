import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import emailService from '@/services/emailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de confirmação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o token existe e não expirou
    const userResult = await pool.query(
      'SELECT id, nome, email, email_confirmation_expires FROM usuarios WHERE email_confirmation_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token de confirmação inválido' },
        { status: 400 }
      );
    }

    const user = userResult.rows[0];

    // Verificar se o token não expirou
    if (new Date() > new Date(user.email_confirmation_expires)) {
      return NextResponse.json(
        { error: 'Token de confirmação expirado' },
        { status: 400 }
      );
    }

    // Verificar se o email já foi confirmado
    if (user.email_confirmado) {
      return NextResponse.json(
        { message: 'Email já foi confirmado anteriormente' },
        { status: 200 }
      );
    }

    // Confirmar o email
    await pool.query(
      'UPDATE usuarios SET email_confirmado = TRUE, email_confirmation_token = NULL, email_confirmation_expires = NULL WHERE id = $1',
      [user.id]
    );

    return NextResponse.json(
      { 
        message: 'Email confirmado com sucesso!',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao confirmar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const userResult = await pool.query(
      'SELECT id, nome, email, email_confirmado FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Se já confirmado, retornar sucesso
    if (user.email_confirmado) {
      return NextResponse.json(
        { message: 'Email já foi confirmado' },
        { status: 200 }
      );
    }

    // Gerar novo token de confirmação
    const { randomBytes } = await import('crypto');
    const confirmationToken = randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Salvar token no banco
    await pool.query(
      'UPDATE usuarios SET email_confirmation_token = $1, email_confirmation_expires = $2 WHERE id = $3',
      [confirmationToken, confirmationExpires, user.id]
    );

    // Enviar email de confirmação
    const emailSent = await emailService.sendEmailConfirmation(
      user.email,
      user.nome,
      confirmationToken
    );

    if (!emailSent) {
      // Se falhou ao enviar email, limpar o token
      await pool.query(
        'UPDATE usuarios SET email_confirmation_token = NULL, email_confirmation_expires = NULL WHERE id = $1',
        [user.id]
      );

      return NextResponse.json(
        { error: 'Erro ao enviar email de confirmação. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Email de confirmação enviado com sucesso! Verifique sua caixa de entrada.',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao gerar token de confirmação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
