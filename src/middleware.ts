import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersegredo_dev';

export async function middleware(request: NextRequest) {
  // Rotas que não precisam de autenticação
  const publicRoutes = [
    '/login',
    '/register',
    '/reset-password',
    '/confirm-email',
    '/api/auth/login',
    '/api/auth/register',
    '/api/reset-password',
    '/api/confirm-email',
    '/_next',
    '/favicon.ico'
  ];

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar token JWT
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Por enquanto, permitir acesso sem verificação de email
    // TODO: Implementar verificação de email no middleware

    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
