const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: process.env.USE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function addResetFields() {
  try {
    const sql = fs.readFileSync('./scripts/add-reset-password-fields.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Campos de reset de senha adicionados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error);
  } finally {
    await pool.end();
  }
}

addResetFields();
