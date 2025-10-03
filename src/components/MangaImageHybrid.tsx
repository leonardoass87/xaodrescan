"use client";

import { useState } from 'react';
import MangaImage from './MangaImage';

interface MangaImageHybridProps {
  titulo: string;
  capa: string;
  className?: string;
}

export default function MangaImageHybrid({ titulo, capa, className = "" }: MangaImageHybridProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Se houve erro ao carregar a imagem real, usa o SVG
  if (imageError) {
    return <MangaImage titulo={titulo} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
      
      <img
        src={capa}
        alt={titulo}
        className="w-full h-full object-cover rounded-lg"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}
