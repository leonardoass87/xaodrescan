import { Pool } from 'pg';

const useSSL = process.env.USE_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

export default pool;
