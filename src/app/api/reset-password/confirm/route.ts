import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import emailService from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { token, novaSenha } = await request.json();

    // Validações básicas
    if (!token || !novaSenha) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação da senha
    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo token
    const userResult = await pool.query(
      'SELECT id, nome, email, reset_token, reset_token_expires FROM usuarios WHERE reset_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    const user = userResult.rows[0];

    // Verificar se o token não expirou
    const now = new Date();
    const tokenExpires = new Date(user.reset_token_expires);
    
    if (now > tokenExpires) {
      // Limpar token expirado
      await pool.query(
        'UPDATE usuarios SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
        [user.id]
      );
      
      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo reset de senha.' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

    // Atualizar senha e limpar token
    await pool.query(
      'UPDATE usuarios SET senha = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2',
      [hashedPassword, user.id]
    );

    // Enviar email de confirmação
    await emailService.sendPasswordResetConfirmation(user.email, user.nome);

    return NextResponse.json(
      { 
        message: 'Senha redefinida com sucesso! Você pode fazer login com sua nova senha.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao confirmar reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET para verificar se o token é válido (sem expor dados sensíveis)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo token
    const userResult = await pool.query(
      'SELECT id, reset_token_expires FROM usuarios WHERE reset_token = $1',
      [token]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      );
    }

    const user = userResult.rows[0];

    // Verificar se o token não expirou
    const now = new Date();
    const tokenExpires = new Date(user.reset_token_expires);
    
    if (now > tokenExpires) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Token válido',
        valid: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
