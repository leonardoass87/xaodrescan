"use client";

import { useState } from 'react';
import Image from 'next/image';
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
      
      <Image
        src={capa}
        alt={titulo}
        fill
        className="object-cover rounded-lg"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        style={{ display: isLoading ? 'none' : 'block' }}
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        quality={75}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}
