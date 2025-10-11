"use client";

import { useState, useEffect } from 'react';
import { getCacheStats } from '@/hooks/useImageCache';

export default function CacheDebug() {
  const [stats, setStats] = useState({ total: 0, loaded: 0, errors: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm border border-gray-600"
      >
        Cache: {stats.loaded}/{stats.total}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg border border-gray-600 min-w-48">
          <h3 className="font-bold mb-2">Cache de Imagens</h3>
          <div className="space-y-1 text-sm">
            <div>Total: {stats.total}</div>
            <div>Carregadas: {stats.loaded}</div>
            <div>Erros: {stats.errors}</div>
            <div className="pt-2 border-t border-gray-600">
              Taxa: {stats.total > 0 ? Math.round((stats.loaded / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
