"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingSpinner() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Mostrar loading ao mudar de rota
    setIsLoading(true);
    
    // Esconder loading após um tempo mínimo
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
      <div className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse">
        <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  );
}

// Spinner discreto para operações específicas
export function MiniSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin`}></div>
  );
}

// Loading overlay para operações que bloqueiam a tela
export function LoadingOverlay({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 border border-red-500/20 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          <span className="text-white font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}
