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

  // Se houve erro ao carregar a imagem real, usa o SVG
  if (imageError) {
    return <MangaImage titulo={titulo} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={capa}
        alt={titulo}
        className="w-full h-full object-cover rounded-lg"
        onError={() => {
          setImageError(true);
        }}
      />
    </div>
  );
}
