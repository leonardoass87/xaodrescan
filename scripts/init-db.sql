-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'usuario' CHECK (role IN ('admin', 'usuario')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice no email para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Inserir usuário de teste (opcional)
INSERT INTO usuarios (nome, email, senha, role) 
VALUES ('Admin', 'admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.O', 'admin')
ON CONFLICT (email) DO NOTHING;