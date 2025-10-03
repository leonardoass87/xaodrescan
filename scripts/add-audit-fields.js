const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Conexão com Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function addAuditFields() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'add-audit-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o SQL
    await pool.query(sql);
    
    console.log('✅ Campos de auditoria adicionados com sucesso!');
    console.log('✅ Campos editado_por e updated_at adicionados às tabelas');
    console.log('✅ Triggers de atualização automática criados');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campos de auditoria:', error.message);
  } finally {
    await pool.end();
  }
}

addAuditFields();
