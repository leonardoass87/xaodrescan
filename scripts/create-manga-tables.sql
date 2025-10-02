-- Criar tabela de mangás
CREATE TABLE IF NOT EXISTS mangas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255),
    generos TEXT[], -- Array de strings para gêneros
    status VARCHAR(50) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'completo', 'pausado')),
    visualizacoes INTEGER DEFAULT 0,
    capa TEXT, -- URL da imagem da capa
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de capítulos
CREATE TABLE IF NOT EXISTS capitulos (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES mangas(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    titulo VARCHAR(255),
    data_publicacao DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, numero) -- Evita capítulos duplicados no mesmo mangá
);

-- Criar tabela de páginas
CREATE TABLE IF NOT EXISTS paginas (
    id SERIAL PRIMARY KEY,
    capitulo_id INTEGER REFERENCES capitulos(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    imagem TEXT NOT NULL, -- URL da imagem da página
    legenda TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(capitulo_id, numero) -- Evita páginas duplicadas no mesmo capítulo
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mangas_titulo ON mangas(titulo);
CREATE INDEX IF NOT EXISTS idx_mangas_status ON mangas(status);
CREATE INDEX IF NOT EXISTS idx_capitulos_manga_id ON capitulos(manga_id);
CREATE INDEX IF NOT EXISTS idx_paginas_capitulo_id ON paginas(capitulo_id);

-- Inserir alguns dados de exemplo
INSERT INTO mangas (titulo, autor, generos, status, capa) VALUES 
('One Piece', 'Eiichiro Oda', ARRAY['Ação', 'Aventura', 'Comédia'], 'em_andamento', 'https://via.placeholder.com/200x300/ff1744/ffffff?text=One+Piece'),
('Attack on Titan', 'Hajime Isayama', ARRAY['Ação', 'Drama', 'Fantasia'], 'completo', 'https://via.placeholder.com/200x300/ff1744/ffffff?text=Attack+on+Titan')
ON CONFLICT DO NOTHING;
