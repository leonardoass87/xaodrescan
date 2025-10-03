"use client";

import { useState } from 'react';
import { useFavoritos } from '@/hooks/useFavoritos';

interface FavoritoButtonProps {
  mangaId: number;
  mangaTitulo: string;
  className?: string;
  showText?: boolean;
}

export default function FavoritoButton({ 
  mangaId, 
  mangaTitulo, 
  className = "",
  showText = true 
}: FavoritoButtonProps) {
  const { isFavoritado, toggleFavorito } = useFavoritos();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const success = await toggleFavorito(mangaId);
      if (success) {
        // Feedback visual opcional
        console.log(`Mangá ${mangaTitulo} ${isFavoritado(mangaId) ? 'removido dos' : 'adicionado aos'} favoritos`);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const favoritado = isFavoritado(mangaId);

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
        ${favoritado 
          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30' 
          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30 hover:bg-gray-500/30'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <span className="text-lg">
        {loading ? '⏳' : favoritado ? '⭐' : '☆'}
      </span>
      {showText && (
        <span className="text-sm">
          {loading 
            ? 'Processando...' 
            : favoritado 
              ? 'Favoritado' 
              : 'Favoritar'
          }
        </span>
      )}
    </button>
  );
}
