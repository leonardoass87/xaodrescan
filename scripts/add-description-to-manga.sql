-- Adicionar campo description à tabela mangas
ALTER TABLE mangas ADD COLUMN description TEXT;

-- Comentário para documentar o campo
COMMENT ON COLUMN mangas.description IS 'Descrição do mangá';
