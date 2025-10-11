import { useState, useEffect } from 'react';
import { loadImageCache, saveImageCache } from './usePersistentImageCache';

interface CachedImage {
  src: string;
  loaded: boolean;
  error: boolean;
}

// Cache global para imagens
const imageCache = new Map<string, CachedImage>();

// Carregar cache persistente na inicialização
const persistentCache = loadImageCache();
Object.entries(persistentCache).forEach(([src, entry]) => {
  imageCache.set(src, {
    src,
    loaded: entry.loaded,
    error: false
  });
});

export const useImageCache = (src: string) => {
  const [state, setState] = useState<CachedImage>(() => {
    // Verificar se já está no cache
    const cached = imageCache.get(src);
    if (cached) {
      return cached;
    }
    
    // Estado inicial
    return {
      src,
      loaded: false,
      error: false
    };
  });

  useEffect(() => {
    // Se já está carregada ou com erro, não fazer nada
    if (state.loaded || state.error) {
      return;
    }

    // Se já está no cache, usar o estado do cache
    const cached = imageCache.get(src);
    if (cached && (cached.loaded || cached.error)) {
      setState(cached);
      return;
    }

    // Criar nova imagem para pré-carregamento
    const img = new Image();
    
    img.onload = () => {
      const newState = { src, loaded: true, error: false };
      imageCache.set(src, newState);
      saveImageCache(src, true); // Salvar no cache persistente
      setState(newState);
    };
    
    img.onerror = () => {
      const newState = { src, loaded: false, error: true };
      imageCache.set(src, newState);
      saveImageCache(src, false); // Salvar no cache persistente
      setState(newState);
    };
    
    // Iniciar carregamento
    img.src = src;
  }, [src, state.loaded, state.error]);

  return state;
};

// Função para pré-carregar múltiplas imagens
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve) => {
      // Se já está no cache, resolver imediatamente
      const cached = imageCache.get(url);
      if (cached && (cached.loaded || cached.error)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.set(url, { src: url, loaded: true, error: false });
        saveImageCache(url, true); // Salvar no cache persistente
        resolve();
      };
      img.onerror = () => {
        imageCache.set(url, { src: url, loaded: false, error: true });
        saveImageCache(url, false); // Salvar no cache persistente
        resolve();
      };
      img.src = url;
    });
  });
  
  return Promise.all(promises);
};

// Função para limpar cache (útil para desenvolvimento)
export const clearImageCache = () => {
  imageCache.clear();
};

// Função para obter estatísticas do cache
export const getCacheStats = () => {
  const total = imageCache.size;
  const loaded = Array.from(imageCache.values()).filter(img => img.loaded).length;
  const errors = Array.from(imageCache.values()).filter(img => img.error).length;
  
  return { total, loaded, errors };
};
