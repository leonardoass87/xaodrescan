import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const filePath = pathArray.join('/');
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    
    
    const file = await readFile(fullPath);
    
    // Determinar o tipo de conteúdo baseado na extensão
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    return new NextResponse(file as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 ano
        'ETag': `"${Date.now()}"`, // ETag para cache eficiente
        'Last-Modified': new Date().toUTCString(),
      },
    });
    
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    return new NextResponse('Arquivo não encontrado', { status: 404 });
  }
}
