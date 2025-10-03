const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debugChapterPages() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Verificando dados dos capítulos e páginas...');
    
    // Buscar todos os capítulos
    const capitulosResult = await client.query(`
      SELECT c.id, c.numero, c.titulo, c.manga_id, 
             COUNT(p.id) as total_paginas
      FROM capitulos c
      LEFT JOIN paginas p ON c.id = p.capitulo_id
      GROUP BY c.id, c.numero, c.titulo, c.manga_id
      ORDER BY c.manga_id, c.numero
    `);
    
    console.log('\n📖 Capítulos encontrados:');
    capitulosResult.rows.forEach(cap => {
      console.log(`- Capítulo ${cap.numero}: ${cap.titulo} (ID: ${cap.id}, Mangá: ${cap.manga_id}, Páginas: ${cap.total_paginas})`);
    });
    
    // Para cada capítulo, mostrar as páginas
    for (const capitulo of capitulosResult.rows) {
      if (capitulo.total_paginas > 0) {
        console.log(`\n📄 Páginas do Capítulo ${capitulo.numero} (ID: ${capitulo.id}):`);
        
        const paginasResult = await client.query(`
          SELECT id, numero, imagem, legenda
          FROM paginas 
          WHERE capitulo_id = $1 
          ORDER BY numero
        `, [capitulo.id]);
        
        paginasResult.rows.forEach(pagina => {
          console.log(`  - Página ${pagina.numero}: ${pagina.imagem}`);
        });
      }
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

debugChapterPages();
