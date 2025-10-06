import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
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
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
    }

    // Hash da senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Gerar token de confirmação de email
    const confirmationToken = randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Inserir usuário (sem confirmação inicial)
    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        role: 'USUARIO',
        email_confirmado: false,
        email_confirmation_token: confirmationToken,
        email_confirmation_expires: confirmationExpires,
      }
    });

    // Enviar email de confirmação
    const emailSent = await emailService.sendEmailConfirmation(
      newUser.email,
      newUser.nome,
      confirmationToken
    );

    // Em desenvolvimento, sempre permitir registro mesmo se email falhar
    if (!emailSent && process.env.NODE_ENV === 'development') {
      console.log('⚠️ [DEV] Email não enviado, mas permitindo registro em desenvolvimento');
      console.log(`🔗 [DEV] Link de confirmação: http://localhost:3000/confirm-email?token=${confirmationToken}`);
    } else if (!emailSent) {
      // Se falhou ao enviar email, limpar o token
      await prisma.usuario.update({
        where: { id: newUser.id },
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

    // Retornar resposta SEM token (usuário precisa confirmar email)
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
        requiresEmailConfirmation: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
