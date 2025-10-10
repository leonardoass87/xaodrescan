"use client";

import { useState } from 'react';
import Image from 'next/image';
import MangaImage from './MangaImage';

interface OptimizedMangaImageProps {
  titulo: string;
  capa: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedMangaImage({ 
  titulo, 
  capa, 
  className = "",
  priority = false 
}: OptimizedMangaImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Se houve erro ao carregar a imagem real, usa o SVG
  if (imageError) {
    return <MangaImage titulo={titulo} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Carregando...
          </div>
        </div>
      )}
      
      <Image
        src={capa}
        alt={titulo}
        fill
        className="object-cover rounded-lg transition-opacity duration-300"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        style={{ 
          display: isLoading ? 'none' : 'block',
          opacity: isLoading ? 0 : 1
        }}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        quality={75}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
}
