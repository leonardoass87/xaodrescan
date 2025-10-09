const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.maxRetries = 10;
    this.retryDelay = 2000; // 2 segundos
  }

  async connect() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan_db_dev';
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.maxRetries} de conexão com o banco...`);
        
        this.pool = new Pool({
          connectionString,
          ssl: false,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          max: 10
        });

        // Testar conexão
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        
        console.log('✅ Conexão com banco estabelecida!');
        return true;
        
      } catch (error) {
        console.log(`❌ Tentativa ${attempt} falhou: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`⏳ Aguardando ${this.retryDelay/1000}s antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          console.error('💥 Falha ao conectar após todas as tentativas');
          throw error;
        }
      }
    }
  }

  async checkTableExists(tableName) {
    try {
      const result = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Erro ao verificar tabela ${tableName}:`, error.message);
      return false;
    }
  }

  async checkColumnExists(tableName, columnName) {
    try {
      const result = await this.pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1 
          AND column_name = $2
        )
      `, [tableName, columnName]);
      return result.rows[0].exists;
    } catch (error) {
      console.error(`Erro ao verificar coluna ${tableName}.${columnName}:`, error.message);
      return false;
    }
  }

  async createTableIfNotExists(tableName, sql) {
    const exists = await this.checkTableExists(tableName);
    if (!exists) {
      console.log(`📝 Criando tabela ${tableName}...`);
      await this.pool.query(sql);
      console.log(`✅ Tabela ${tableName} criada!`);
      return true;
    } else {
      console.log(`✅ Tabela ${tableName} já existe`);
      return false;
    }
  }

  async addColumnIfNotExists(tableName, columnName, columnDefinition) {
    const exists = await this.checkColumnExists(tableName, columnName);
    if (!exists) {
      console.log(`📝 Adicionando coluna ${tableName}.${columnName}...`);
      await this.pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      console.log(`✅ Coluna ${tableName}.${columnName} adicionada!`);
      return true;
    } else {
      console.log(`✅ Coluna ${tableName}.${columnName} já existe`);
      return false;
    }
  }

  async createIndexIfNotExists(indexName, sql) {
    try {
      await this.pool.query(sql);
      console.log(`✅ Índice ${indexName} criado/verificado!`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Índice ${indexName} já existe`);
      } else {
        throw error;
      }
    }
  }

  async createTriggerIfNotExists(triggerName, sql) {
    try {
      await this.pool.query(sql);
      console.log(`✅ Trigger ${triggerName} criado/verificado!`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Trigger ${triggerName} já existe`);
      } else {
        throw error;
      }
    }
  }

  async setupDatabase() {
    try {
      console.log('🚀 Iniciando setup automático do banco de dados...\n');
      
      await this.connect();
      
      // 1. Criar função de trigger se não existir
      console.log('1️⃣ Verificando função de trigger...');
      await this.pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      console.log('✅ Função de trigger criada/atualizada!');

      // 2. Criar tabela de usuários
      console.log('\n2️⃣ Verificando tabela de usuários...');
      await this.createTableIfNotExists('usuarios', `
        CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          senha VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'usuario' CHECK (role IN ('admin', 'usuario')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Criar tabela de mangás
      console.log('\n3️⃣ Verificando tabela de mangás...');
      await this.createTableIfNotExists('mangas', `
        CREATE TABLE mangas (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          autor VARCHAR(255),
          generos TEXT[],
          status VARCHAR(50) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'completo', 'pausado')),
          visualizacoes INTEGER DEFAULT 0,
          capa TEXT,
          data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Criar tabela de capítulos
      console.log('\n4️⃣ Verificando tabela de capítulos...');
      await this.createTableIfNotExists('capitulos', `
        CREATE TABLE capitulos (
          id SERIAL PRIMARY KEY,
          manga_id INTEGER REFERENCES mangas(id) ON DELETE CASCADE,
          numero INTEGER NOT NULL,
          titulo VARCHAR(255),
          data_publicacao DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(manga_id, numero)
        );
      `);

      // 5. Criar tabela de páginas
      console.log('\n5️⃣ Verificando tabela de páginas...');
      await this.createTableIfNotExists('paginas', `
        CREATE TABLE paginas (
          id SERIAL PRIMARY KEY,
          capitulo_id INTEGER REFERENCES capitulos(id) ON DELETE CASCADE,
          numero INTEGER NOT NULL,
          imagem TEXT NOT NULL,
          legenda TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(capitulo_id, numero)
        );
      `);

      // 6. Criar tabela de favoritos
      console.log('\n6️⃣ Verificando tabela de favoritos...');
      await this.createTableIfNotExists('favoritos', `
        CREATE TABLE favoritos (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
          manga_id INTEGER REFERENCES mangas(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(usuario_id, manga_id)
        );
      `);

      // 7. Adicionar campos de auditoria se não existirem
      console.log('\n7️⃣ Verificando campos de auditoria...');
      
      // Campos para mangás
      await this.addColumnIfNotExists('mangas', 'editado_por', 'VARCHAR(255)');
      await this.addColumnIfNotExists('mangas', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      
      // Campos para capítulos
      await this.addColumnIfNotExists('capitulos', 'editado_por', 'VARCHAR(255)');
      await this.addColumnIfNotExists('capitulos', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      
      // Campos para páginas
      await this.addColumnIfNotExists('paginas', 'editado_por', 'VARCHAR(255)');
      await this.addColumnIfNotExists('paginas', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

      // 8. Criar índices
      console.log('\n8️⃣ Verificando índices...');
      await this.createIndexIfNotExists('idx_usuarios_email', 'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);');
      await this.createIndexIfNotExists('idx_mangas_titulo', 'CREATE INDEX IF NOT EXISTS idx_mangas_titulo ON mangas(titulo);');
      await this.createIndexIfNotExists('idx_mangas_status', 'CREATE INDEX IF NOT EXISTS idx_mangas_status ON mangas(status);');
      await this.createIndexIfNotExists('idx_capitulos_manga_id', 'CREATE INDEX IF NOT EXISTS idx_capitulos_manga_id ON capitulos(manga_id);');
      await this.createIndexIfNotExists('idx_paginas_capitulo_id', 'CREATE INDEX IF NOT EXISTS idx_paginas_capitulo_id ON paginas(capitulo_id);');

      // 9. Criar triggers
      console.log('\n9️⃣ Verificando triggers...');
      await this.createTriggerIfNotExists('update_mangas_updated_at', `
        DROP TRIGGER IF EXISTS update_mangas_updated_at ON mangas;
        CREATE TRIGGER update_mangas_updated_at 
          BEFORE UPDATE ON mangas 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
      
      await this.createTriggerIfNotExists('update_capitulos_updated_at', `
        DROP TRIGGER IF EXISTS update_capitulos_updated_at ON capitulos;
        CREATE TRIGGER update_capitulos_updated_at 
          BEFORE UPDATE ON capitulos 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
      
      await this.createTriggerIfNotExists('update_paginas_updated_at', `
        DROP TRIGGER IF EXISTS update_paginas_updated_at ON paginas;
        CREATE TRIGGER update_paginas_updated_at 
          BEFORE UPDATE ON paginas 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      // 10. Inserir dados iniciais se necessário
      console.log('\n🔟 Verificando dados iniciais...');
      
      // Verificar se usuário admin existe
      const adminExists = await this.pool.query(`
        SELECT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@teste.com')
      `);
      
      if (!adminExists.rows[0].exists) {
        console.log('📝 Inserindo usuário admin...');
        await this.pool.query(`
          INSERT INTO usuarios (nome, email, senha, role) 
          VALUES ('Admin', 'admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.O', 'admin')
        `);
        console.log('✅ Usuário admin criado!');
      } else {
        console.log('✅ Usuário admin já existe');
      }

      // 11. Verificação final
      console.log('\n🔍 Verificação final...');
      const tables = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('📋 Tabelas disponíveis:');
      tables.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));
      
      console.log('\n🎉 Setup do banco concluído com sucesso!');
      console.log('📝 Usuário admin: admin@teste.com / 123456');
      
    } catch (error) {
      console.error('❌ Erro durante setup:', error.message);
      throw error;
    } finally {
      if (this.pool) {
        await this.pool.end();
      }
    }
  }
}

// Executar setup
const dbManager = new DatabaseManager();
dbManager.setupDatabase().catch(error => {
  console.error('💥 Falha crítica no setup:', error);
  process.exit(1);
});
