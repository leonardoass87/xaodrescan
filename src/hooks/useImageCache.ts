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
    // Se src for inválido, marcar como erro para exibir fallback e evitar loading infinito
    const normalizedSrc = typeof src === 'string' ? src.trim() : '';

    if (!normalizedSrc) {
      const erroState: CachedImage = { src: normalizedSrc, loaded: false, error: true };
      return erroState;
    }

    // Verificar se já está no cache
    const cached = imageCache.get(normalizedSrc);
    if (cached) {
      return cached;
    }

    // Estado inicial
    return {
      src: normalizedSrc,
      loaded: false,
      error: false
    };
  });

  useEffect(() => {
    const normalizedSrc = typeof src === 'string' ? src.trim() : '';

    // Proteger contra src vazio/indefinido
    if (!normalizedSrc) {
      const newState = { src: normalizedSrc, loaded: false, error: true };
      imageCache.set(normalizedSrc, newState);
      saveImageCache(normalizedSrc, false);
      setState(newState);
      return;
    }

    // Se já está carregada ou com erro, não fazer nada
    if (state.loaded || state.error) {
      return;
    }

    // Se já está no cache, usar o estado do cache
    const cached = imageCache.get(normalizedSrc);
    if (cached && (cached.loaded || cached.error)) {
      setState(cached);
      return;
    }

    // Criar nova imagem para pré-carregamento
    const img = new Image();
    // Ajudar o navegador a processar mais rápido (propriedades opcionais)
    try {
      (img as any).decoding = 'async';
      (img as any).loading = 'eager';
    } catch {}
    
    img.onload = () => {
      const newState = { src: normalizedSrc, loaded: true, error: false };
      imageCache.set(normalizedSrc, newState);
      saveImageCache(normalizedSrc, true); // Salvar no cache persistente
      setState(newState);
      window.clearTimeout(timeoutId);
    };
    
    img.onerror = () => {
      const newState = { src: normalizedSrc, loaded: false, error: true };
      imageCache.set(normalizedSrc, newState);
      saveImageCache(normalizedSrc, false); // Salvar no cache persistente
      setState(newState);
      window.clearTimeout(timeoutId);
    };
    
    // Iniciar carregamento
    img.src = normalizedSrc;

    // Timeout de segurança para evitar loading infinito em casos raros
    const timeoutId = window.setTimeout(() => {
      const newState = { src: normalizedSrc, loaded: false, error: true };
      imageCache.set(normalizedSrc, newState);
      saveImageCache(normalizedSrc, false);
      setState(newState);
    }, 15000); // 15 segundos

    return () => {
      window.clearTimeout(timeoutId);
    };
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
