import { NextRequest, NextResponse } from 'next/server';
import dbInitializer from '@/lib/database-init';

export async function GET(request: NextRequest) {
  try {
    // Inicializar banco se necessário
    await dbInitializer.initialize();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
