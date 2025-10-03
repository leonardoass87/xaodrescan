const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function diagnoseDatabase() {
  try {
    console.log('🔍 Diagnóstico do Banco de Dados\n');
    
    // 1. Verificar conexão
    console.log('1️⃣ Testando conexão...');
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log(`✅ Conexão OK - Hora atual: ${connectionTest.rows[0].current_time}\n`);
    
    // 2. Verificar tabelas existentes
    console.log('2️⃣ Verificando tabelas...');
    const tables = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada!');
      console.log('💡 Execute: node scripts/setup-complete-db.js');
      return;
    }
    
    console.log('📋 Tabelas encontradas:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name} (${row.table_type})`));
    
    // 3. Verificar estrutura de cada tabela
    console.log('\n3️⃣ Verificando estrutura das tabelas...');
    for (const table of tables.rows) {
      console.log(`\n📊 Estrutura da tabela '${table.table_name}':`);
      
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    }
    
    // 4. Verificar constraints e índices
    console.log('\n4️⃣ Verificando constraints e índices...');
    const constraints = await pool.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type
    `);
    
    if (constraints.rows.length > 0) {
      console.log('🔗 Constraints encontradas:');
      constraints.rows.forEach(constraint => {
        console.log(`  - ${constraint.table_name}.${constraint.column_name}: ${constraint.constraint_type}`);
      });
    }
    
    // 5. Verificar triggers
    console.log('\n5️⃣ Verificando triggers...');
    const triggers = await pool.query(`
      SELECT trigger_name, event_object_table, action_timing, event_manipulation
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    if (triggers.rows.length > 0) {
      console.log('⚡ Triggers encontrados:');
      triggers.rows.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name} em ${trigger.event_object_table} (${trigger.action_timing} ${trigger.event_manipulation})`);
      });
    } else {
      console.log('❌ Nenhum trigger encontrado');
    }
    
    // 6. Verificar dados
    console.log('\n6️⃣ Verificando dados...');
    for (const table of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) as total FROM ${table.table_name}`);
      console.log(`  - ${table.table_name}: ${count.rows[0].total} registros`);
    }
    
    console.log('\n✅ Diagnóstico concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
    
    // Diagnóstico específico de erros
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Problema: PostgreSQL não está rodando');
      console.log('🔧 Solução: Inicie o PostgreSQL');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Problema: Credenciais incorretas');
      console.log('🔧 Solução: Verifique usuário e senha no DATABASE_URL');
    } else if (error.message.includes('database does not exist')) {
      console.log('\n💡 Problema: Banco de dados não existe');
      console.log('🔧 Solução: Crie o banco "xaodrescan" primeiro');
    }
  } finally {
    await pool.end();
  }
}

diagnoseDatabase();
