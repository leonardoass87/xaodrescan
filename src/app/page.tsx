"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useMangasCombinados } from '@/hooks/useMangasCombinados';
import MangaCard from '@/components/MangaCard';
import Pagination from '@/components/Pagination';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { 
    mangas, 
    loading, 
    error, 
    paginaAtual,
    totalPaginas,
    total,
    mudarPagina,
    limite
  } = useMangasCombinados();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mangás...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Bem-vindo ao <span className="text-red-500">XaodreScan</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Descubra e leia os melhores mangás online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/catalogo"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explorar Catálogo
            </Link>
            <Link 
              href="/lancamentos"
              className="bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Lançamentos
            </Link>
          </div>
        </div>

        {/* Grid de Mangás */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white">
              Mangás Disponíveis
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-400">
              <span>
                {total} {total === 1 ? 'mangá' : 'mangás'} encontrados
              </span>
              <span className="text-sm">
                (Página {paginaAtual} de {totalPaginas})
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Grid Responsivo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {/* Paginação */}
          <Pagination
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            onPageChange={mudarPagina}
            loading={loading}
          />
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">{total}</div>
            <div className="text-gray-300">Mangás Disponíveis</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {mangas.filter(m => m.status === 'EM_ANDAMENTO').length}
            </div>
            <div className="text-gray-300">Em Andamento</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {mangas.filter(m => m.status === 'COMPLETO').length}
            </div>
            <div className="text-gray-300">Completos</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-gray-300 mb-8">
            Junte-se a milhares de leitores e descubra novos mundos através dos mangás
          </p>
          {user ? (
            <Link 
              href="/catalogo"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Explorar Agora
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login"
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Fazer Login
              </Link>
              <Link 
                href="/register"
                className="bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}