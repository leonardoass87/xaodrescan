const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estrutura do banco de dados...\n');
    
    // Verificar tabelas existentes
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas existentes:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log('');
    
    // Verificar campos de auditoria em cada tabela
    const tablesToCheck = ['mangas', 'capitulos', 'paginas', 'usuarios'];
    
    for (const tableName of tablesToCheck) {
      console.log(`🔍 Verificando campos de auditoria em '${tableName}':`);
      
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name IN ('editado_por', 'updated_at', 'created_at', 'data_adicao')
        ORDER BY column_name
      `, [tableName]);
      
      if (columns.rows.length > 0) {
        columns.rows.forEach(col => {
          console.log(`  ✅ ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
        });
      } else {
        console.log(`  ❌ Nenhum campo de auditoria encontrado`);
      }
      console.log('');
    }
    
    // Verificar triggers
    console.log('🔧 Verificando triggers:');
    const triggers = await pool.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    if (triggers.rows.length > 0) {
      triggers.rows.forEach(trigger => {
        console.log(`  ✅ ${trigger.trigger_name} em ${trigger.event_object_table} (${trigger.action_timing} ${trigger.event_manipulation})`);
      });
    } else {
      console.log('  ❌ Nenhum trigger encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

checkDatabase();
