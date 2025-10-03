import { useState, useEffect, useCallback } from 'react';
import { Manga } from '@/types/manga';
import { carregarMangas } from '@/data/mockMangas';
import { useScreenSize } from './useScreenSize';

export const useMangasCombinados = () => {
  const { isMobile, isTablet } = useScreenSize();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [total, setTotal] = useState(0);

  // Determinar limite baseado no tamanho da tela
  const getLimite = useCallback(() => {
    if (isMobile) return 10;
    if (isTablet) return 16;
    return 20; // Desktop
  }, [isMobile, isTablet]);

  // Função para buscar mangás reais da API
  const buscarMangasReais = async (): Promise<Manga[]> => {
    try {
      const response = await fetch('/api/mangas');
      if (!response.ok) {
        throw new Error('Erro ao buscar mangás reais');
      }
      const mangasReais = await response.json();
      
      // Converter formato da API para formato do frontend
      return mangasReais.map((manga: any) => ({
        id: manga.id,
        titulo: manga.titulo,
        autor: manga.autor || 'Autor Desconhecido',
        generos: manga.generos || [],
        status: manga.status,
        capa: manga.capa || '/images/mangas/placeholder.jpg',
        dataAdicao: manga.data_adicao || manga.dataAdicao || new Date().toISOString(),
        totalCapitulos: manga.total_capitulos || 0
      }));
    } catch (error) {
      console.error('Erro ao buscar mangás reais:', error);
      return [];
    }
  };

  // Função para combinar dados reais + mockados
  const combinarDados = async (pagina: number, limite: number) => {
    setLoading(true);
    setError(null);
    
    try {
      let todosMangas: Manga[] = [];
      
      // Buscar mangás reais (sempre primeiro)
      try {
        const mangasReais = await buscarMangasReais();
        console.log('Mangás reais encontrados:', mangasReais.length);
        todosMangas = [...mangasReais];
      } catch (error) {
        console.log('Erro ao buscar mangás reais, usando apenas mockados:', error);
      }
      
      // Buscar mangás mockados
      try {
        const mockadosResponse = await carregarMangas(1, 1000);
        const mangasMockados = mockadosResponse?.mangas || [];
        console.log('Mangás mockados encontrados:', mangasMockados.length);
        todosMangas = [...todosMangas, ...mangasMockados];
      } catch (error) {
        console.log('Erro ao buscar mangás mockados:', error);
      }
      
      console.log('Total de mangás combinados:', todosMangas.length);
      
      // Ordenar por data de adição (mais recentes primeiro)
      todosMangas.sort((a, b) => {
        const dataA = new Date(a.dataAdicao || '2024-01-01').getTime();
        const dataB = new Date(b.dataAdicao || '2024-01-01').getTime();
        return dataB - dataA; // Mais recente primeiro
      });
      
      // Aplicar paginação
      const inicio = (pagina - 1) * limite;
      const fim = inicio + limite;
      const mangasPagina = todosMangas.slice(inicio, fim);
      
      setMangas(mangasPagina);
      setPaginaAtual(pagina);
      setTotalPaginas(Math.ceil(todosMangas.length / limite));
      setTotal(todosMangas.length);
      
    } catch (err) {
      setError('Erro ao carregar mangás');
      console.error('Erro ao combinar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const mudarPagina = useCallback((novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas && novaPagina !== paginaAtual) {
      combinarDados(novaPagina, getLimite());
    }
  }, [totalPaginas, paginaAtual, getLimite]);

  const recarregar = useCallback(() => {
    combinarDados(paginaAtual, getLimite());
  }, [paginaAtual, getLimite]);

  // Carregar mangás iniciais
  useEffect(() => {
    combinarDados(1, getLimite());
  }, [getLimite]);

  // Recarregar quando o tamanho da tela mudar (para ajustar limite)
  useEffect(() => {
    if (paginaAtual > 1) {
      combinarDados(1, getLimite());
    }
  }, [isMobile, isTablet]);

  return {
    mangas,
    loading,
    error,
    paginaAtual,
    totalPaginas,
    total,
    mudarPagina,
    recarregar,
    limite: getLimite()
  };
};
