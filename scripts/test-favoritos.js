const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testFavoritos() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Testando sistema de favoritos...');
    
    // Verificar se a tabela favoritos existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'favoritos'
      );
    `);
    
    console.log('✅ Tabela favoritos existe:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Verificar estrutura da tabela
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'favoritos'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estrutura da tabela favoritos:');
      structure.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Verificar se há dados
      const count = await client.query('SELECT COUNT(*) as total FROM favoritos');
      console.log(`\n📊 Total de favoritos: ${count.rows[0].total}`);
      
      // Verificar usuários
      const users = await client.query('SELECT id, nome, email FROM usuarios LIMIT 5');
      console.log('\n👥 Usuários disponíveis:');
      users.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Nome: ${user.nome}, Email: ${user.email}`);
      });
      
      // Verificar mangás
      const mangas = await client.query('SELECT id, titulo FROM mangas LIMIT 5');
      console.log('\n📚 Mangás disponíveis:');
      mangas.rows.forEach(manga => {
        console.log(`- ID: ${manga.id}, Título: ${manga.titulo}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

testFavoritos();
