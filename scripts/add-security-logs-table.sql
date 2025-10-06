-- Criar tabela de logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES usuarios(id),
  ip VARCHAR(45) NOT NULL,
  user_agent TEXT,
  action VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB,
  success BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_timestamp ON security_logs(ip, timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_action_timestamp ON security_logs(action, timestamp);


