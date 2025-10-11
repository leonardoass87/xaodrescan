"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import CachedMangaImage from '@/components/CachedMangaImage';

export default function MeusFavoritos() {
  const { user, isLoading: authLoading } = useAuth();
  const { favoritos, loading, error, carregarFavoritos } = useFavoritos();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando favoritos...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatarVisualizacoes = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completo": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "pausado": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_andamento": return "Em Andamento";
      case "completo": return "Completo";
      case "pausado": return "Pausado";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
            <span className="mr-3">⭐</span>
            Meus Favoritos
          </h1>
          <p className="text-gray-400">
            {favoritos.length} {favoritos.length === 1 ? 'mangá favoritado' : 'mangás favoritados'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-300">{error}</p>
            <button 
              onClick={carregarFavoritos}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {favoritos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-400 mb-6">
              Comece explorando mangás e adicione seus favoritos!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <span>🔍</span>
              Explorar Mangás
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {favoritos.map((favorito) => (
              <div 
                key={favorito.id} 
                className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-300 group hover:scale-105"
              >
                <Link href={`/manga/${favorito.manga_id}`}>
                  <div className="relative">
                    <div className="w-full h-48 sm:h-56">
                      <CachedMangaImage 
                        titulo={favorito.titulo}
                        capa={favorito.capa}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(favorito.status)}`}>
                        {getStatusText(favorito.status)}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                        ⭐ Favoritado
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/manga/${favorito.manga_id}`}>
                    <h3 className="text-white font-bold text-lg mb-1 hover:text-red-400 transition-colors line-clamp-2">
                      {favorito.titulo}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-400 text-sm mb-3 truncate">
                    {favorito.autor}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                    <span>👁️ {formatarVisualizacoes(favorito.visualizacoes)}</span>
                    <span>📅 {new Date(favorito.data_favorito).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/manga/${favorito.manga_id}`}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg py-2 px-3 text-center text-sm font-medium transition-colors"
                    >
                      Ler Agora
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
