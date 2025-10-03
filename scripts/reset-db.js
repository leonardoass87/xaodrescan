const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function resetDatabase() {
  try {
    console.log('⚠️  ATENÇÃO: Isso vai apagar TODOS os dados do banco!');
    console.log('🔄 Resetando banco de dados...\n');
    
    // Dropar todas as tabelas em ordem (respeitando foreign keys)
    const dropOrder = [
      'DROP TABLE IF EXISTS favoritos CASCADE;',
      'DROP TABLE IF EXISTS paginas CASCADE;', 
      'DROP TABLE IF EXISTS capitulos CASCADE;',
      'DROP TABLE IF EXISTS mangas CASCADE;',
      'DROP TABLE IF EXISTS usuarios CASCADE;'
    ];
    
    for (const sql of dropOrder) {
      console.log(`🗑️  Executando: ${sql}`);
      await pool.query(sql);
    }
    
    // Dropar funções e triggers
    await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
    
    console.log('✅ Banco resetado com sucesso!');
    console.log('💡 Agora execute: node scripts/setup-complete-db.js');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error.message);
  } finally {
    await pool.end();
  }
}

resetDatabase();
