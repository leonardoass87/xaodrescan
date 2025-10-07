import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configurações para uploads grandes
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const index = formData.get('index') as string;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Tipo de arquivo não suportado: ${file.type}` 
      }, { status: 400 });
    }

    // Validar tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB. Máximo: 10MB` 
      }, { status: 400 });
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Criar diretório de uploads se não existir
    const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
    await mkdir(uploadsDir, { recursive: true });

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension);
    const uniqueName = `${baseName}_${timestamp}_${index}${extension}`;
    
    // Salvar arquivo
    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    // Retornar informações do arquivo
    return NextResponse.json({
      success: true,
      file: {
        originalName: file.name,
        savedName: uniqueName,
        size: file.size,
        type: file.type,
        path: `/uploads/temp/${uniqueName}`,
        index: parseInt(index)
      }
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor durante o upload' },
      { status: 500 }
    );
  }
}
