const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Pool para conexão direta com PostgreSQL (para migração)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: false
});

async function migrateToPrisma() {
  try {
    console.log('🔄 Iniciando migração para Prisma...');

    // 1. Verificar se as tabelas existem
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'mangas', 'capitulos', 'paginas', 'favoritos', 'security_logs')
    `);

    console.log('📋 Tabelas encontradas:', tablesCheck.rows.map(r => r.table_name));

    // 2. Migrar dados de usuários
    if (tablesCheck.rows.some(r => r.table_name === 'usuarios')) {
      console.log('👥 Migrando usuários...');
      const usuarios = await pool.query('SELECT * FROM usuarios');
      
      for (const usuario of usuarios.rows) {
        await prisma.usuario.upsert({
          where: { email: usuario.email },
          update: {
            nome: usuario.nome,
            senha: usuario.senha,
            role: usuario.role.toUpperCase(),
            email_confirmado: usuario.email_confirmado || false,
            email_confirmation_token: usuario.email_confirmation_token,
            email_confirmation_expires: usuario.email_confirmation_expires,
          },
          create: {
            nome: usuario.nome,
            email: usuario.email,
            senha: usuario.senha,
            role: usuario.role.toUpperCase(),
            email_confirmado: usuario.email_confirmado || false,
            email_confirmation_token: usuario.email_confirmation_token,
            email_confirmation_expires: usuario.email_confirmation_expires,
          }
        });
      }
      console.log(`✅ ${usuarios.rows.length} usuários migrados`);
    }

    // 3. Migrar dados de mangás
    if (tablesCheck.rows.some(r => r.table_name === 'mangas')) {
      console.log('📚 Migrando mangás...');
      const mangas = await pool.query('SELECT * FROM mangas');
      
      for (const manga of mangas.rows) {
        await prisma.manga.upsert({
          where: { id: manga.id },
          update: {
            titulo: manga.titulo,
            autor: manga.autor,
            generos: manga.generos || [],
            status: manga.status.toUpperCase().replace('_', '_'),
            visualizacoes: manga.visualizacoes || 0,
            capa: manga.capa,
          },
          create: {
            id: manga.id,
            titulo: manga.titulo,
            autor: manga.autor,
            generos: manga.generos || [],
            status: manga.status.toUpperCase().replace('_', '_'),
            visualizacoes: manga.visualizacoes || 0,
            capa: manga.capa,
          }
        });
      }
      console.log(`✅ ${mangas.rows.length} mangás migrados`);
    }

    // 4. Migrar capítulos
    if (tablesCheck.rows.some(r => r.table_name === 'capitulos')) {
      console.log('📖 Migrando capítulos...');
      const capitulos = await pool.query('SELECT * FROM capitulos');
      
      for (const capitulo of capitulos.rows) {
        await prisma.capitulo.upsert({
          where: { id: capitulo.id },
          update: {
            manga_id: capitulo.manga_id,
            numero: capitulo.numero,
            titulo: capitulo.titulo,
            data_publicacao: capitulo.data_publicacao,
          },
          create: {
            id: capitulo.id,
            manga_id: capitulo.manga_id,
            numero: capitulo.numero,
            titulo: capitulo.titulo,
            data_publicacao: capitulo.data_publicacao,
          }
        });
      }
      console.log(`✅ ${capitulos.rows.length} capítulos migrados`);
    }

    // 5. Migrar páginas
    if (tablesCheck.rows.some(r => r.table_name === 'paginas')) {
      console.log('🖼️ Migrando páginas...');
      const paginas = await pool.query('SELECT * FROM paginas');
      
      for (const pagina of paginas.rows) {
        await prisma.pagina.upsert({
          where: { id: pagina.id },
          update: {
            capitulo_id: pagina.capitulo_id,
            numero: pagina.numero,
            imagem: pagina.imagem,
            legenda: pagina.legenda,
          },
          create: {
            id: pagina.id,
            capitulo_id: pagina.capitulo_id,
            numero: pagina.numero,
            imagem: pagina.imagem,
            legenda: pagina.legenda,
          }
        });
      }
      console.log(`✅ ${paginas.rows.length} páginas migradas`);
    }

    // 6. Migrar favoritos
    if (tablesCheck.rows.some(r => r.table_name === 'favoritos')) {
      console.log('❤️ Migrando favoritos...');
      const favoritos = await pool.query('SELECT * FROM favoritos');
      
      for (const favorito of favoritos.rows) {
        await prisma.favorito.upsert({
          where: { id: favorito.id },
          update: {
            usuario_id: favorito.usuario_id,
            manga_id: favorito.manga_id,
            data_favorito: favorito.data_favorito,
          },
          create: {
            id: favorito.id,
            usuario_id: favorito.usuario_id,
            manga_id: favorito.manga_id,
            data_favorito: favorito.data_favorito,
          }
        });
      }
      console.log(`✅ ${favoritos.rows.length} favoritos migrados`);
    }

    // 7. Migrar logs de segurança
    if (tablesCheck.rows.some(r => r.table_name === 'security_logs')) {
      console.log('🔒 Migrando logs de segurança...');
      const logs = await pool.query('SELECT * FROM security_logs');
      
      for (const log of logs.rows) {
        await prisma.securityLog.upsert({
          where: { id: log.id },
          update: {
            user_id: log.user_id,
            ip: log.ip,
            user_agent: log.user_agent,
            action: log.action,
            severity: log.severity,
            details: log.details,
            success: log.success,
          },
          create: {
            id: log.id,
            user_id: log.user_id,
            ip: log.ip,
            user_agent: log.user_agent,
            action: log.action,
            severity: log.severity,
            details: log.details,
            success: log.success,
          }
        });
      }
      console.log(`✅ ${logs.rows.length} logs de segurança migrados`);
    }

    console.log('🎉 Migração concluída com sucesso!');
    console.log('💡 Agora você pode usar o Prisma em todo o projeto');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migrateToPrisma();
