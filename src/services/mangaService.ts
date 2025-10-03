import { Manga, MangasResponse } from '@/types/manga';

// Função para carregar mangás da API real (futuro)
export const carregarMangasAPI = async (
  pagina: number = 1, 
  limite: number = 12,
  filtros?: {
    status?: string;
    genero?: string;
    busca?: string;
  }
): Promise<MangasResponse> => {
  try {
    const params = new URLSearchParams({
      pagina: pagina.toString(),
      limite: limite.toString(),
      ...(filtros?.status && { status: filtros.status }),
      ...(filtros?.genero && { genero: filtros.genero }),
      ...(filtros?.busca && { busca: filtros.busca }),
    });

    const response = await fetch(`/api/mangas?${params}`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar mangás');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na API de mangás:', error);
    throw error;
  }
};

// Função para buscar um mangá específico
export const buscarManga = async (id: number): Promise<Manga> => {
  try {
    const response = await fetch(`/api/mangas/${id}`);
    
    if (!response.ok) {
      throw new Error('Mangá não encontrado');
    }

    const data = await response.json();
    return data.manga;
  } catch (error) {
    console.error('Erro ao buscar mangá:', error);
    throw error;
  }
};

// Função para buscar mangás por categoria
export const buscarMangasPorCategoria = async (
  categoria: string,
  pagina: number = 1,
  limite: number = 12
): Promise<MangasResponse> => {
  return carregarMangasAPI(pagina, limite, { genero: categoria });
};

// Função para buscar mangás por status
export const buscarMangasPorStatus = async (
  status: string,
  pagina: number = 1,
  limite: number = 12
): Promise<MangasResponse> => {
  return carregarMangasAPI(pagina, limite, { status });
};

// Função para buscar mangás por texto
export const buscarMangas = async (
  termo: string,
  pagina: number = 1,
  limite: number = 12
): Promise<MangasResponse> => {
  return carregarMangasAPI(pagina, limite, { busca: termo });
};
