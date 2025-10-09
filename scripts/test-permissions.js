// Script para testar permissões de upload
const fs = require('fs');
const path = require('path');

async function testPermissions() {
  console.log('🧪 Testando permissões de upload...');
  
  const testDir = path.join(process.cwd(), 'uploads', 'capitulos', 'test');
  const testFile = path.join(testDir, 'test.txt');
  
  try {
    // Testar criação de diretório
    console.log('📁 Criando diretório:', testDir);
    await fs.promises.mkdir(testDir, { recursive: true, mode: 0o777 });
    console.log('✅ Diretório criado com sucesso');
    
    // Testar escrita de arquivo
    console.log('📄 Criando arquivo:', testFile);
    await fs.promises.writeFile(testFile, 'test content', { mode: 0o666 });
    console.log('✅ Arquivo criado com sucesso');
    
    // Verificar permissões
    const stats = await fs.promises.stat(testDir);
    console.log('🔍 Permissões do diretório:', stats.mode.toString(8));
    
    const fileStats = await fs.promises.stat(testFile);
    console.log('🔍 Permissões do arquivo:', fileStats.mode.toString(8));
    
    // Limpar
    await fs.promises.unlink(testFile);
    await fs.promises.rmdir(testDir);
    console.log('🧹 Arquivos de teste removidos');
    
    console.log('✅ Teste de permissões concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste de permissões:', error);
    process.exit(1);
  }
}

testPermissions();
