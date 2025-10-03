-- Tabela de favoritos (relação N:N entre usuarios e mangas)
CREATE TABLE IF NOT EXISTS favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    manga_id INTEGER NOT NULL REFERENCES mangas(id) ON DELETE CASCADE,
    data_favorito TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_favorito UNIQUE(usuario_id, manga_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_id ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_manga_id ON favoritos(manga_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_data ON favoritos(data_favorito);

-- Comentários para documentação
COMMENT ON TABLE favoritos IS 'Tabela de relacionamento N:N entre usuarios e mangas para favoritos';
COMMENT ON COLUMN favoritos.usuario_id IS 'ID do usuário que favoritou';
COMMENT ON COLUMN favoritos.manga_id IS 'ID do mangá favoritado';
COMMENT ON COLUMN favoritos.data_favorito IS 'Data e hora em que foi favoritado';
