const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log('🔍 Testando conexão com Prisma...');

    // Teste 1: Conectar ao banco
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');

    // Teste 2: Contar usuários
    const userCount = await prisma.usuario.count();
    console.log(`📊 Total de usuários: ${userCount}`);

    // Teste 3: Contar mangás
    const mangaCount = await prisma.manga.count();
    console.log(`📚 Total de mangás: ${mangaCount}`);

    // Teste 4: Contar favoritos
    const favoritoCount = await prisma.favorito.count();
    console.log(`❤️ Total de favoritos: ${favoritoCount}`);

    // Teste 5: Buscar usuário com relacionamentos
    const userWithFavoritos = await prisma.usuario.findFirst({
      include: {
        favoritos: {
          include: {
            manga: true
          }
        }
      }
    });

    if (userWithFavoritos) {
      console.log(`👤 Usuário encontrado: ${userWithFavoritos.nome}`);
      console.log(`❤️ Favoritos: ${userWithFavoritos.favoritos.length}`);
    }

    // Teste 6: Buscar mangá com relacionamentos
    const mangaWithCapitulos = await prisma.manga.findFirst({
      include: {
        capitulos: {
          include: {
            paginas: true
          }
        }
      }
    });

    if (mangaWithCapitulos) {
      console.log(`📖 Mangá encontrado: ${mangaWithCapitulos.titulo}`);
      console.log(`📑 Capítulos: ${mangaWithCapitulos.capitulos.length}`);
    }

    console.log('🎉 Todos os testes do Prisma passaram!');
    console.log('💡 O Prisma está funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro ao testar Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
