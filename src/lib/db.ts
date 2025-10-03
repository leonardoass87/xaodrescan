import { Pool } from 'pg';
import dbInitializer from './database-init';

const useSSL = process.env.USE_SSL === 'true';

// Função para obter pool com inicialização automática
async function getPool(): Promise<Pool> {
  await dbInitializer.initialize();
  return await dbInitializer.getPool();
}

// Pool padrão (para compatibilidade)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

// Função para usar pool com inicialização
export async function getInitializedPool(): Promise<Pool> {
  return await getPool();
}

export default pool;
