"use client";

import Link from 'next/link';
import { Manga } from '@/types/manga';
import FavoritoButton from './FavoritoButton';
import MangaImageHybrid from './MangaImageHybrid';

interface MangaCardProps {
  manga: Manga;
  showFavorito?: boolean;
}

export default function MangaCard({ manga, showFavorito = true }: MangaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completo": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_andamento": return "Em Andamento";
      case "completo": return "Completo";
      default: return status;
    }
  };

  const formatarVisualizacoes = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
      <Link href={`/manga/${manga.id}`}>
        <div className="relative">
          <div className="w-full h-48 sm:h-56 md:h-64">
            <MangaImageHybrid 
              titulo={manga.titulo}
              capa={manga.capa}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          </div>
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(manga.status)}`}>
              {getStatusText(manga.status)}
            </span>
          </div>
          {manga.visualizacoes && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                👁️ {formatarVisualizacoes(manga.visualizacoes)}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/manga/${manga.id}`}>
          <h3 className="text-white font-bold text-lg mb-2 hover:text-red-400 transition-colors line-clamp-2">
            {manga.titulo}
          </h3>
        </Link>
        
        {manga.autor && (
          <p className="text-gray-400 text-sm mb-3 truncate">
            por {manga.autor}
          </p>
        )}
        
        {manga.generos && manga.generos.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {manga.generos.slice(0, 2).map((genero, index) => (
              <span 
                key={index}
                className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30"
              >
                {genero}
              </span>
            ))}
            {manga.generos.length > 2 && (
              <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs">
                +{manga.generos.length - 2}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Link 
            href={`/manga/${manga.id}`}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg py-2 px-3 text-center text-sm font-medium transition-colors mr-2"
          >
            Ler Agora
          </Link>
          
          {showFavorito && (
            <FavoritoButton 
              mangaId={manga.id}
              mangaTitulo={manga.titulo}
              className="flex-shrink-0"
              showText={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
