const fs = require('fs');
const path = require('path');

async function testImageAccess() {
  try {
    const imagePath = path.join(process.cwd(), 'uploads', 'capitulos', '9', 'pagina_9_3_1759509428107.jpg');
    
    console.log('Testando acesso à imagem:');
    console.log('- Caminho completo:', imagePath);
    console.log('- Arquivo existe:', fs.existsSync(imagePath));
    
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      console.log('- Tamanho do arquivo:', stats.size, 'bytes');
      console.log('- Data de modificação:', stats.mtime);
    }
    
    // Testar URL que seria gerada
    const url = '/uploads/capitulos/9/pagina_9_3_1759509428107.jpg';
    console.log('- URL que seria usada:', url);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testImageAccess();
