import { useState, useEffect } from 'react';

interface AdminStats {
  usuarios: {
    total: number;
    crescimento: number;
  };
  mangas: {
    total: number;
    crescimento: number;
  };
  capitulos: {
    total: number;
    crescimento: number;
  };
  visualizacoes: {
    total: number;
    crescimento: number;
  };
  atividades: {
    usuariosRecentes: Array<{
      nome: string;
      email: string;
      created_at: string;
    }>;
    mangasRecentes: Array<{
      titulo: string;
      data_adicao: string;
      autor: string;
    }>;
    capitulosRecentes: Array<{
      numero: number;
      titulo: string;
      data_publicacao: string;
      manga_titulo: string;
    }>;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/mangas?stats=true');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
