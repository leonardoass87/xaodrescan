"use client";

import type { Metadata } from "next";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// export const metadata: Metadata = {
//   title: "Painel Administrativo - XaodreScan",
//   description: "Painel de administração para gerenciar usuários e mangás",
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin())) {
      router.push('/login');
    }
  }, [user, isAdmin, isLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Verificando permissões...</div>
      </div>
    );
  }

  // Se não é admin, não renderizar nada (será redirecionado)
  if (!user || !isAdmin()) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-black/50 backdrop-blur-sm border-r border-red-500/20">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center">
              <span className="text-red-500 mr-2">⚡</span>
              Admin Panel
            </h1>
            
            <nav className="space-y-4">
              <a 
                href="/admin" 
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
              >
                <span className="mr-3 text-red-400 group-hover:text-red-300">📊</span>
                Dashboard
              </a>
              
              <a 
                href="/admin/usuarios" 
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
              >
                <span className="mr-3 text-red-400 group-hover:text-red-300">👥</span>
                Usuários
              </a>
              
              <a 
                href="/admin/mangas" 
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
              >
                <span className="mr-3 text-red-400 group-hover:text-red-300">📚</span>
                Mangás
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}