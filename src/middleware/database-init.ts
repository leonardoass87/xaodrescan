import { NextRequest, NextResponse } from 'next/server';
import dbInitializer from '@/lib/database-init';

// Flag para evitar múltiplas inicializações simultâneas
let isInitializing = false;

export async function databaseInitMiddleware(request: NextRequest) {
  // Só inicializa em rotas de API
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Se já está inicializando, aguarda
  if (isInitializing) {
    return NextResponse.next();
  }

  try {
    isInitializing = true;
    await dbInitializer.initialize();
  } catch (error) {
    console.error('❌ Erro na inicialização automática do banco:', error);
    // Não falha a requisição, apenas loga o erro
  } finally {
    isInitializing = false;
  }

  return NextResponse.next();
}
