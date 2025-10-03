import { useState, useEffect, useCallback } from 'react';
import { Manga, MangasResponse } from '@/types/manga';
import { carregarMangasAPI } from '@/services/mangaService';

export const useMangas = (limiteInicial: number = 12, usarAPI: boolean = true) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(true);
  const [total, setTotal] = useState(0);

  // Função para carregar dados da API
  const carregarDados = async (paginaAtual: number, limite: number) => {
    return await carregarMangasAPI(paginaAtual, limite);
  };

  const carregarMangasInicial = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await carregarDados(1, limiteInicial);
      setMangas(response.mangas);
      setPagina(1);
      setTemMais(response.temMais);
      setTotal(response.total);
    } catch (err) {
      setError('Erro ao carregar mangás');
    } finally {
      setLoading(false);
    }
  }, [limiteInicial, usarAPI]);

  const carregarMaisMangas = useCallback(async () => {
    if (loadingMore || !temMais) return;
    
    setLoadingMore(true);
    setError(null);
    
    try {
      const proximaPagina = pagina + 1;
      const response = await carregarDados(proximaPagina, limiteInicial);
      
      setMangas(prev => [...prev, ...response.mangas]);
      setPagina(proximaPagina);
      setTemMais(response.temMais);
    } catch (err) {
      setError('Erro ao carregar mais mangás');
    } finally {
      setLoadingMore(false);
    }
  }, [pagina, temMais, loadingMore, limiteInicial, usarAPI]);

  const recarregar = useCallback(() => {
    carregarMangasInicial();
  }, [carregarMangasInicial]);

  // Carregar mangás iniciais
  useEffect(() => {
    carregarMangasInicial();
  }, [carregarMangasInicial]);

  return {
    mangas,
    loading,
    loadingMore,
    error,
    temMais,
    total,
    carregarMaisMangas,
    recarregar
  };
};
