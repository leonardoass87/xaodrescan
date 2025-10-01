const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Conexão com Postgres SEM SSL (forçado)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function setupDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sql);
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('✅ Tabela "usuarios" criada');
    console.log('✅ Usuário de teste criado: admin@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
