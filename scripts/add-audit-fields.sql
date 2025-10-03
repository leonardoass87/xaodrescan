-- Adicionar campos de auditoria às tabelas existentes

-- Adicionar campos de auditoria à tabela mangas
ALTER TABLE mangas 
ADD COLUMN IF NOT EXISTS editado_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos de auditoria à tabela capitulos
ALTER TABLE capitulos 
ADD COLUMN IF NOT EXISTS editado_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar campos de auditoria à tabela paginas
ALTER TABLE paginas 
ADD COLUMN IF NOT EXISTS editado_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_mangas_updated_at ON mangas;
CREATE TRIGGER update_mangas_updated_at 
    BEFORE UPDATE ON mangas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_capitulos_updated_at ON capitulos;
CREATE TRIGGER update_capitulos_updated_at 
    BEFORE UPDATE ON capitulos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_paginas_updated_at ON paginas;
CREATE TRIGGER update_paginas_updated_at 
    BEFORE UPDATE ON paginas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar dados existentes com valores padrão
UPDATE mangas SET updated_at = data_adicao WHERE updated_at IS NULL;
UPDATE capitulos SET updated_at = data_publicacao WHERE updated_at IS NULL;
UPDATE paginas SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
