import { useState, useEffect } from 'react';

interface UseViewsResult {
  visualizacoes: number;
  loading: boolean;
  error: string | null;
  incrementarView: () => Promise<void>;
  carregarViews: () => Promise<void>;
}

export const useViews = (mangaId: number): UseViewsResult => {
  const [visualizacoes, setVisualizacoes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const carregarViews = async () => {
    if (!mangaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/mangas/${mangaId}/increment-view`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar visualizações');
      }
      
      const data = await response.json();
      setVisualizacoes(data.visualizacoes || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar visualizações:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementarView = async () => {
    if (!mangaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/mangas/${mangaId}/increment-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao incrementar visualização');
      }
      
      const data = await response.json();
      setVisualizacoes(data.visualizacoes || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao incrementar visualização:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarViews();
  }, [mangaId]);

  return {
    visualizacoes,
    loading,
    error,
    incrementarView,
    carregarViews
  };
};
