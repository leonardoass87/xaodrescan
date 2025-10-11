"use client";

import { useImageCache } from '@/hooks/useImageCache';
import MangaImage from './MangaImage';

interface CachedMangaImageProps {
  titulo: string;
  capa: string;
  className?: string;
}

export default function CachedMangaImage({ titulo, capa, className = "" }: CachedMangaImageProps) {
  const { loaded, error } = useImageCache(capa);

  // Se houve erro, usar SVG fallback
  if (error) {
    return <MangaImage titulo={titulo} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Carregando...
          </div>
        </div>
      )}
      
      <img
        src={capa}
        alt={titulo}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </div>
  );
}
