import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import emailService from '@/services/emailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirmationToken = searchParams.get('token');

    if (!confirmationToken) {
      return NextResponse.json(
        { error: 'Token de confirmação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o token existe e não expirou
    const user = await prisma.usuario.findFirst({
      where: { email_confirmation_token: confirmationToken },
      select: {
        id: true,
        nome: true,
        email: true,
        email_confirmation_expires: true,
        email_confirmado: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de confirmação inválido' },
        { status: 400 }
      );
    }

    // Verificar se o token não expirou
    if (user.email_confirmation_expires && new Date() > new Date(user.email_confirmation_expires)) {
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
    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        email_confirmado: true,
        email_confirmation_token: null,
        email_confirmation_expires: null,
      }
    });

    // Gerar token JWT após confirmação do email
    const token = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      userId: updatedUser.id,
      email_confirmado: true
    });

    // Criar resposta com cookie
    const response = NextResponse.json(
      { 
        message: 'Email confirmado com sucesso! Você está logado.',
        success: true,
        user: {
          id: updatedUser.id,
          nome: updatedUser.nome,
          email: updatedUser.email,
          role: updatedUser.role,
          email_confirmado: true
        }
      },
      { status: 200 }
    );

    // Definir cookie com o token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    return response;

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
    const user = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        email_confirmado: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

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
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        email_confirmation_token: confirmationToken,
        email_confirmation_expires: confirmationExpires,
      }
    });

    // Enviar email de confirmação
    const emailSent = await emailService.sendEmailConfirmation(
      user.email,
      user.nome,
      confirmationToken
    );

    if (!emailSent) {
      // Se falhou ao enviar email, limpar o token
      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          email_confirmation_token: null,
          email_confirmation_expires: null,
        }
      });

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
