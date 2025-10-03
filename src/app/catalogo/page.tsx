'use client';

import Link from 'next/link';

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        {/* Ícone grande */}
        <div className="text-8xl mb-6">📚</div>
        
        {/* Título */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Catálogo em Desenvolvimento
        </h1>
        
        {/* Descrição */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          Estamos trabalhando para trazer uma experiência completa de catálogo com filtros avançados, 
          busca inteligente e organização por gêneros. Em breve você poderá explorar todos os mangás 
          de forma mais eficiente!
        </p>
        
        {/* Features em desenvolvimento */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            🚀 Funcionalidades em Desenvolvimento:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-2xl">🔍</span>
              <span>Busca avançada por título e autor</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-2xl">📊</span>
              <span>Filtros por status e gênero</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-2xl">📱</span>
              <span>Interface responsiva otimizada</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-2xl">⚡</span>
              <span>Carregamento rápido e eficiente</span>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            🏠 Voltar ao Início
          </Link>
          <Link
            href="/lancamentos"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            🆕 Ver Lançamentos
          </Link>
        </div>
        
        {/* Status */}
        <div className="mt-8 text-sm text-gray-500">
          <p>⏳ Em desenvolvimento • Previsão: Em breve</p>
        </div>
      </div>
    </div>
  );
}
