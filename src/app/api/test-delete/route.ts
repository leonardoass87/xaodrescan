import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  console.log('Test DELETE endpoint chamado');
  return NextResponse.json({ 
    success: true, 
    message: 'API DELETE funcionando!',
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test endpoint funcionando!',
    methods: ['GET', 'DELETE']
  });
}
