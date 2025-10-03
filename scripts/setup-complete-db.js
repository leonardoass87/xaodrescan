const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Iniciando configuração completa do banco de dados...\n');
    
    // 1. Criar tabela de usuários primeiro
    console.log('1️⃣ Criando tabela de usuários...');
    const initDbSql = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    await pool.query(initDbSql);
    console.log('✅ Tabela de usuários criada com sucesso!');
    
    // 2. Criar tabelas de mangás
    console.log('\n2️⃣ Criando tabelas de mangás...');
    const mangaTablesSql = fs.readFileSync(path.join(__dirname, 'create-manga-tables.sql'), 'utf8');
    await pool.query(mangaTablesSql);
    console.log('✅ Tabelas de mangás criadas com sucesso!');
    
    // 3. Adicionar campos de auditoria
    console.log('\n3️⃣ Adicionando campos de auditoria...');
    const auditSql = fs.readFileSync(path.join(__dirname, 'add-audit-fields.sql'), 'utf8');
    await pool.query(auditSql);
    console.log('✅ Campos de auditoria adicionados com sucesso!');
    
    // 4. Verificar estrutura final
    console.log('\n4️⃣ Verificando estrutura final...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas criadas:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Verificar campos de auditoria
    const auditFields = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('mangas', 'capitulos', 'paginas', 'usuarios')
      AND column_name IN ('editado_por', 'updated_at')
      ORDER BY table_name, column_name
    `);
    
    console.log('\n🔍 Campos de auditoria:');
    auditFields.rows.forEach(field => {
      console.log(`  ✅ ${field.table_name}.${field.column_name}`);
    });
    
    console.log('\n🎉 Banco de dados configurado completamente!');
    console.log('📝 Usuário admin: admin@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Tentar identificar o problema específico
    if (error.message.includes('already exists')) {
      console.log('\n💡 Dica: Algumas tabelas já existem. Isso é normal se você já executou o script antes.');
    } else if (error.message.includes('permission denied')) {
      console.log('\n💡 Dica: Verifique as permissões do usuário do banco de dados.');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Dica: Verifique se o PostgreSQL está rodando e acessível.');
    }
  } finally {
    await pool.end();
  }
}

setupCompleteDatabase();
