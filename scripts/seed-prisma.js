const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Criar usuário admin
    const adminPassword = await bcrypt.hash('123456', 12);
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@teste.com' },
      update: {},
      create: {
        nome: 'Admin',
        email: 'admin@teste.com',
        senha: adminPassword,
        role: 'ADMIN',
        email_confirmado: true,
      }
    });
    console.log('✅ Usuário admin criado:', admin.email);

    // 2. Criar usuário de teste
    const userPassword = await bcrypt.hash('123456', 12);
    const user = await prisma.usuario.upsert({
      where: { email: 'usuario@teste.com' },
      update: {},
      create: {
        nome: 'Usuário Teste',
        email: 'usuario@teste.com',
        senha: userPassword,
        role: 'USUARIO',
        email_confirmado: true,
      }
    });
    console.log('✅ Usuário de teste criado:', user.email);

    // 3. Criar mangás de exemplo
    const manga1 = await prisma.manga.upsert({
      where: { id: 1 },
      update: {},
      create: {
        titulo: 'One Piece',
        autor: 'Eiichiro Oda',
        generos: ['Ação', 'Aventura', 'Comédia'],
        status: 'EM_ANDAMENTO',
        visualizacoes: 1000,
        capa: 'https://via.placeholder.com/200x300/ff1744/ffffff?text=One+Piece',
      }
    });
    console.log('✅ Mangá criado:', manga1.titulo);

    const manga2 = await prisma.manga.upsert({
      where: { id: 2 },
      update: {},
      create: {
        titulo: 'Attack on Titan',
        autor: 'Hajime Isayama',
        generos: ['Ação', 'Drama', 'Fantasia'],
        status: 'COMPLETO',
        visualizacoes: 800,
        capa: 'https://via.placeholder.com/200x300/ff1744/ffffff?text=Attack+on+Titan',
      }
    });
    console.log('✅ Mangá criado:', manga2.titulo);

    // 4. Criar capítulos
    const capitulo1 = await prisma.capitulo.upsert({
      where: { id: 1 },
      update: {},
      create: {
        manga_id: manga1.id,
        numero: 1,
        titulo: 'Romance Dawn',
        data_publicacao: new Date('2023-01-01'),
      }
    });
    console.log('✅ Capítulo criado:', capitulo1.titulo);

    const capitulo2 = await prisma.capitulo.upsert({
      where: { id: 2 },
      update: {},
      create: {
        manga_id: manga2.id,
        numero: 1,
        titulo: 'Para Você, daqui a 2000 anos',
        data_publicacao: new Date('2023-01-15'),
      }
    });
    console.log('✅ Capítulo criado:', capitulo2.titulo);

    // 5. Criar páginas
    await prisma.pagina.upsert({
      where: { id: 1 },
      update: {},
      create: {
        capitulo_id: capitulo1.id,
        numero: 1,
        imagem: 'https://via.placeholder.com/800x1200/000000/ffffff?text=Página+1',
        legenda: 'Primeira página do capítulo',
      }
    });
    console.log('✅ Página criada');

    // 6. Criar favoritos
    await prisma.favorito.upsert({
      where: { id: 1 },
      update: {},
      create: {
        usuario_id: user.id,
        manga_id: manga1.id,
      }
    });
    console.log('✅ Favorito criado');

    // 7. Criar log de segurança
    await prisma.securityLog.create({
      data: {
        user_id: admin.id,
        ip: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action: 'LOGIN',
        severity: 'LOW',
        details: { success: true },
        success: true,
      }
    });
    console.log('✅ Log de segurança criado');

    console.log('🎉 Seed concluído com sucesso!');
    console.log('📊 Dados criados:');
    console.log('   - 2 usuários (admin e usuário)');
    console.log('   - 2 mangás');
    console.log('   - 2 capítulos');
    console.log('   - 1 página');
    console.log('   - 1 favorito');
    console.log('   - 1 log de segurança');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
