import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Favorito {
  id: number;
  data_favorito: string;
  manga_id: number;
  titulo: string;
  autor: string;
  capa: string;
  status: string;
  visualizacoes: number;
  data_adicao: string;
}

export const useFavoritos = () => {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Carregar favoritos do usuário
  const carregarFavoritos = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favoritos?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setFavoritos(data.favoritos || []);
        setInitialized(true);
      } else {
        setError(data.error || 'Erro ao carregar favoritos');
        setFavoritos([]);
        setInitialized(true);
      }
    } catch (err) {
      setError('Erro de conexão');
      setFavoritos([]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar favorito
  const adicionarFavorito = async (mangaId: number) => {
    if (!user?.id) return false;

    try {
      const response = await fetch('/api/favoritos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          mangaId: mangaId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar favoritos
        await carregarFavoritos();
        return true;
      } else {
        setError(data.error || 'Erro ao adicionar favorito');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    }
  };

  // Remover favorito
  const removerFavorito = async (mangaId: number) => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/favoritos?userId=${user.id}&mangaId=${mangaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar favoritos
        await carregarFavoritos();
        return true;
      } else {
        setError(data.error || 'Erro ao remover favorito');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão');
      return false;
    }
  };

  // Verificar se um mangá está favoritado
  const isFavoritado = (mangaId: number) => {
    if (!initialized || !favoritos || !Array.isArray(favoritos)) {
      return false;
    }
    return favoritos.some(fav => fav.manga_id === mangaId);
  };

  // Toggle favorito (adicionar ou remover)
  const toggleFavorito = async (mangaId: number) => {
    if (isFavoritado(mangaId)) {
      return await removerFavorito(mangaId);
    } else {
      return await adicionarFavorito(mangaId);
    }
  };

  // Carregar favoritos quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      setInitialized(false);
      carregarFavoritos();
    } else {
      setFavoritos([]);
      setInitialized(true);
    }
  }, [user?.id]);

  return {
    favoritos: favoritos || [],
    loading,
    error,
    initialized,
    carregarFavoritos,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    isFavoritado
  };
};
