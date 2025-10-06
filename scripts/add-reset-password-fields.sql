-- Adicionar campos para reset de senha na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Criar índice para o reset_token para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON usuarios(reset_token);
