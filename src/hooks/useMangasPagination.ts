import { useState, useEffect, useCallback } from 'react';
import { Manga, MangasResponse } from '@/types/manga';
import { carregarMangasAPI } from '@/services/mangaService';
import { useScreenSize } from './useScreenSize';

export const useMangasPagination = (usarAPI: boolean = true) => {
  const { isMobile, isTablet, isDesktop } = useScreenSize();
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

  // Função para carregar dados da API
  const carregarDados = async (pagina: number, limite: number) => {
    return await carregarMangasAPI(pagina, limite);
  };

  const carregarMangasPagina = useCallback(async (pagina: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const limite = getLimite();
      const response = await carregarDados(pagina, limite);
      
      setMangas(response.mangas);
      setPaginaAtual(pagina);
      setTotalPaginas(Math.ceil(response.total / limite));
      setTotal(response.total);
    } catch (err) {
      setError('Erro ao carregar mangás');
    } finally {
      setLoading(false);
    }
  }, [getLimite, usarAPI]);

  const mudarPagina = useCallback((novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas && novaPagina !== paginaAtual) {
      carregarMangasPagina(novaPagina);
    }
  }, [carregarMangasPagina, totalPaginas, paginaAtual]);

  const recarregar = useCallback(() => {
    carregarMangasPagina(paginaAtual);
  }, [carregarMangasPagina, paginaAtual]);

  // Carregar mangás iniciais
  useEffect(() => {
    carregarMangasPagina(1);
  }, [carregarMangasPagina]);

  // Recarregar quando o tamanho da tela mudar (para ajustar limite)
  useEffect(() => {
    if (paginaAtual > 1) {
      carregarMangasPagina(1);
    }
  }, [isMobile, isTablet, isDesktop]);

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
