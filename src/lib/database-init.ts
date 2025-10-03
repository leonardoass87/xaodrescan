import { Pool } from 'pg';

class DatabaseInitializer {
  private pool: Pool | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Se já está inicializando, aguarda o processo
    if (this.initPromise) {
      return this.initPromise;
    }

    // Se já foi inicializado, retorna imediatamente
    if (this.isInitialized) {
      return;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🔄 Inicializando banco de dados...');
      
      // Executar script de setup automático
      const { spawn } = require('child_process');
      const path = require('path');
      
      return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'auto-setup-db.js');
        
        const child = spawn('node', [scriptPath], {
          stdio: 'inherit',
          cwd: process.cwd()
        });

        child.on('close', (code: number) => {
          if (code === 0) {
            console.log('✅ Banco de dados inicializado com sucesso!');
            this.isInitialized = true;
            resolve();
          } else {
            console.error('❌ Falha na inicialização do banco');
            reject(new Error(`Script falhou com código ${code}`));
          }
        });

        child.on('error', (error: Error) => {
          console.error('❌ Erro ao executar script de setup:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Erro na inicialização do banco:', error);
      throw error;
    }
  }

  async getPool(): Promise<Pool> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.USE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    }

    return this.pool;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Instância singleton
const dbInitializer = new DatabaseInitializer();

export default dbInitializer;
