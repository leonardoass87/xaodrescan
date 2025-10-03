const { Pool } = require('pg');

class DockerHealthChecker {
  constructor() {
    this.maxRetries = 30; // 30 tentativas
    this.retryDelay = 2000; // 2 segundos entre tentativas
  }

  async waitForDatabase() {
    console.log('🐳 Aguardando banco de dados ficar disponível...');
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.maxRetries}...`);
        
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
          ssl: false,
          connectionTimeoutMillis: 5000
        });

        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        await pool.end();
        
        console.log('✅ Banco de dados está disponível!');
        return true;
        
      } catch (error) {
        console.log(`❌ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`⏳ Aguardando ${this.retryDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          console.error('💥 Banco de dados não ficou disponível após todas as tentativas');
          throw error;
        }
      }
    }
  }

  async checkDockerEnvironment() {
    console.log('🔍 Verificando ambiente Docker...');
    
    // Verificar se estamos em ambiente Docker
    const isDocker = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres');
    
    if (isDocker) {
      console.log('🐳 Ambiente Docker detectado');
      console.log(`📡 DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
    } else {
      console.log('💻 Ambiente local detectado');
    }
    
    return isDocker;
  }

  async runHealthCheck() {
    try {
      console.log('🚀 Iniciando verificação de saúde do banco...\n');
      
      await this.checkDockerEnvironment();
      await this.waitForDatabase();
      
      console.log('\n🎉 Banco de dados está pronto para uso!');
      return true;
      
    } catch (error) {
      console.error('\n💥 Falha na verificação de saúde:', error.message);
      return false;
    }
  }
}

// Executar verificação
const healthChecker = new DockerHealthChecker();
healthChecker.runHealthCheck().then(success => {
  process.exit(success ? 0 : 1);
});
