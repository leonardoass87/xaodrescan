-- Adicionar campos para confirmação de email
ALTER TABLE usuarios 
ADD COLUMN email_confirmado BOOLEAN DEFAULT FALSE,
ADD COLUMN email_confirmation_token VARCHAR(255),
ADD COLUMN email_confirmation_expires TIMESTAMP;

-- Criar índice para otimizar consultas
CREATE INDEX idx_email_confirmation_token ON usuarios(email_confirmation_token);
CREATE INDEX idx_email_confirmado ON usuarios(email_confirmado);
