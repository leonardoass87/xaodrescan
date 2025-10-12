import { useEffect } from 'react';

// Chave para localStorage
const CACHE_KEY = 'manga_images_cache';
const MAX_CACHE_SIZE = 50; // Máximo de 50 imagens no cache
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

interface CacheEntry {
  src: string;
  timestamp: number;
  loaded: boolean;
}

// Função para salvar cache no localStorage
export const saveImageCache = (src: string, loaded: boolean) => {
  try {
    const existingCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    
    // Adicionar nova entrada
    existingCache[src] = {
      src,
      timestamp: Date.now(),
      loaded
    };
    
    // Limitar tamanho do cache
    const entries = Object.entries(existingCache);
    if (entries.length > MAX_CACHE_SIZE) {
      // Remover entradas mais antigas
      entries.sort((a, b) => (b[1] as CacheEntry).timestamp - (a[1] as CacheEntry).timestamp);
      const toKeep = entries.slice(0, MAX_CACHE_SIZE);
      const newCache = Object.fromEntries(toKeep);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(existingCache));
    }
  } catch (error) {
    console.warn('Erro ao salvar cache de imagens:', error);
  }
};

// Função para carregar cache do localStorage
export const loadImageCache = (): Record<string, CacheEntry> => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};
    
    const parsedCache = JSON.parse(cache);
    const now = Date.now();
    
    // Remover entradas expiradas
    const validEntries = Object.entries(parsedCache).filter(([_, entry]) => {
      const cacheEntry = entry as CacheEntry;
      return now - cacheEntry.timestamp < CACHE_EXPIRY;
    });
    
    return Object.fromEntries(validEntries) as Record<string, CacheEntry>;
  } catch (error) {
    console.warn('Erro ao carregar cache de imagens:', error);
    return {};
  }
};

// Função para limpar cache expirado
export const cleanExpiredCache = () => {
  try {
    const cache = loadImageCache();
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Erro ao limpar cache expirado:', error);
  }
};

// Hook para gerenciar cache persistente
export const usePersistentImageCache = () => {
  useEffect(() => {
    // Limpar cache expirado na inicialização
    cleanExpiredCache();
    
    // Limpar cache expirado a cada hora
    const interval = setInterval(cleanExpiredCache, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    saveImageCache,
    loadImageCache,
    cleanExpiredCache
  };
};
