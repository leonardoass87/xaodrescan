const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Função para otimizar uma imagem
async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    console.log(`Otimizando: ${path.basename(inputPath)} (${(originalSize / 1024).toFixed(1)}KB)`);
    
    await sharp(inputPath)
      .resize(800, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Otimizado: ${(newSize / 1024).toFixed(1)}KB (${reduction}% redução)`);
    
    return { originalSize, newSize, reduction };
  } catch (error) {
    console.error(`❌ Erro ao otimizar ${inputPath}:`, error.message);
    return null;
  }
}

// Função para processar todas as imagens
async function optimizeAllImages() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const optimizedDir = path.join(process.cwd(), 'uploads-optimized');
  
  // Criar diretório otimizado
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  let processed = 0;
  
  // Encontrar todas as imagens
  const findImages = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findImages(fullPath));
      } else if (/\.(jpg|jpeg|png)$/i.test(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  };
  
  const imageFiles = findImages(uploadsDir);
  console.log(`Encontradas ${imageFiles.length} imagens para otimizar...\n`);
  
  for (const imagePath of imageFiles) {
    const relativePath = path.relative(uploadsDir, imagePath);
    const outputPath = path.join(optimizedDir, relativePath);
    
    // Criar diretório de destino se não existir
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const result = await optimizeImage(imagePath, outputPath);
    if (result) {
      totalOriginal += result.originalSize;
      totalOptimized += result.newSize;
      processed++;
    }
  }
  
  console.log(`\n📊 Resumo da Otimização:`);
  console.log(`Imagens processadas: ${processed}/${imageFiles.length}`);
  console.log(`Tamanho original: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Tamanho otimizado: ${(totalOptimized / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Redução total: ${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`\n✅ Imagens otimizadas salvas em: ${optimizedDir}`);
  console.log(`\nPara aplicar as otimizações:`);
  console.log(`1. Faça backup da pasta uploads atual`);
  console.log(`2. Substitua a pasta uploads pela uploads-optimized`);
}

// Verificar se sharp está instalado
try {
  require('sharp');
  optimizeAllImages().catch(console.error);
} catch (error) {
  console.log('❌ Sharp não está instalado. Instalando...');
  console.log('Execute: npm install sharp');
  console.log('Depois execute novamente este script.');
}
