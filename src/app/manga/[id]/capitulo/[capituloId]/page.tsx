"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useViews } from '@/hooks/useViews';

interface Pagina {
  id: number;
  numero: number;
  imagem: string;
  legenda?: string;
}

interface Capitulo {
  id: number;
  numero: number;
  titulo: string;
  data_publicacao: string;
  paginas: Pagina[];
}

interface Manga {
  id: number;
  titulo: string;
  autor: string;
  status: string;
  capa: string;
}

export default function LeitorPage() {
  const params = useParams();
  const router = useRouter();
  const { info } = useNotificationContext();
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [capitulo, setCapitulo] = useState<Capitulo | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoLeitura, setModoLeitura] = useState<'pagina' | 'scroll'>('scroll');
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [proximoCapitulo, setProximoCapitulo] = useState<any>(null);

  // Hook para gerenciar visualizações (só incrementa quando realmente lê)
  const { visualizacoes, loading: viewsLoading, error: viewsError } = useViews(
    manga?.id || 0
  );

  // Handlers para carregamento de imagens
  const handleImageLoad = (paginaId: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(paginaId);
      return newSet;
    });
  };

  const handleImageStart = (paginaId: number) => {
    setLoadingImages(prev => new Set(prev).add(paginaId));
  };

  // Carregar dados do mangá e capítulo
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados do mangá e capítulo usando API específica
        const response = await fetch(`/api/mangas/${params.id}/capitulo/${params.capituloId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Capítulo não encontrado');
        }
        
        const data = await response.json();
        
        
        setManga({
          id: data.manga.id,
          titulo: data.manga.titulo,
          autor: data.manga.autor || 'Autor Desconhecido',
          status: data.manga.status,
          capa: data.manga.capa
        });

        setCapitulo(data.capitulo);
        setProximoCapitulo(data.proximoCapitulo);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar o capítulo');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.capituloId) {
      carregarDados();
    }
  }, [params.id, params.capituloId]);

  // Navegação entre páginas
  const proximaPagina = useCallback(() => {
    if (capitulo && paginaAtual < capitulo.paginas.length - 1) {
      setPaginaAtual(prev => prev + 1);
    }
  }, [capitulo, paginaAtual]);

  const paginaAnterior = useCallback(() => {
    if (paginaAtual > 0) {
      setPaginaAtual(prev => prev - 1);
    }
  }, [paginaAtual]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        proximaPagina();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paginaAnterior();
      } else if (e.key === 'Escape') {
        setShowControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [proximaPagina, paginaAnterior]);

  // Auto-hide controls
  useEffect(() => {
    if (modoLeitura === 'pagina') {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [modoLeitura, paginaAtual]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando capítulo...</div>
      </div>
    );
  }

  if (error || !manga || !capitulo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌</div>
          <div className="text-white text-xl mb-4">{error || 'Capítulo não encontrado'}</div>
          <Link 
            href={`/manga/${params.id}`}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar ao Mangá
          </Link>
        </div>
      </div>
    );
  }

  // Verificar se há páginas
  if (!capitulo.paginas || capitulo.paginas.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-2xl mb-4">⚠️</div>
          <div className="text-white text-xl mb-4">Este capítulo não possui páginas</div>
          <Link 
            href={`/manga/${params.id}`}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar ao Mangá
          </Link>
        </div>
      </div>
    );
  }

  const pagina = capitulo.paginas[paginaAtual];
  const totalPaginas = capitulo.paginas.length;
  

  // Usar formato de scroll vertical para todos os dispositivos (mobile e desktop)
  // Removido o MobileReader para usar o mesmo formato em todos os dispositivos

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header com controles - responsivo */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href={`/manga/${params.id}`}
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                ← Voltar
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">{manga.titulo}</h1>
                <p className="text-sm text-gray-400">{capitulo.titulo}</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold truncate max-w-32">{manga.titulo}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-400">
                {paginaAtual + 1} / {totalPaginas}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                👁️ {viewsLoading ? '...' : visualizacoes.toLocaleString()}
              </div>
              
              {/* Controles apenas no desktop */}
              <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setModoLeitura(modoLeitura === 'pagina' ? 'scroll' : 'pagina')}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm transition-colors"
                >
                  {modoLeitura === 'pagina' ? '📄' : '📜'}
                </button>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom(Math.max(0.8, zoom - 0.1))}
                    className="px-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(Math.min(4, zoom + 0.1))}
                    className="px-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="px-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    title="Reset zoom"
                  >
                    ↺
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de leitura */}
      <div className="pt-16">
        {modoLeitura === 'pagina' ? (
          // Modo página única
          <div className="flex justify-center items-center min-h-screen">
            <div className="relative w-full max-w-7xl px-2 sm:px-4">
              {pagina && (
                <>
                  {loadingImages.has(pagina.id) && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center z-10">
                      <div className="text-gray-400 text-sm">Carregando página {pagina.numero}...</div>
                    </div>
                  )}
                  <img
                    src={pagina.imagem.startsWith('/uploads/') ? pagina.imagem : `/uploads/${pagina.imagem}`}
                    alt={`Página ${pagina.numero}`}
                    className="w-full h-auto block"
                    loading="eager"
                    decoding="async"
                    style={{ 
                      transform: `scale(${zoom})`,
                      maxHeight: 'none',
                      minHeight: '80vh',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    onLoadStart={() => handleImageStart(pagina.id)}
                    onLoad={() => handleImageLoad(pagina.id)}
                    onError={(e) => {
                      handleImageLoad(pagina.id);
                      console.error('Erro ao carregar imagem:', pagina.imagem);
                      console.error('URL tentada:', e.currentTarget.src);
                      
                      // Tentar URL alternativa para capítulos antigos
                      const alternativeUrl = pagina.imagem.replace('/uploads/', '/api/uploads/');
                      if (alternativeUrl !== e.currentTarget.src) {
                        console.log('🔄 Tentando URL alternativa:', alternativeUrl);
                        e.currentTarget.src = alternativeUrl;
                      } else {
                      info('Erro de Imagem', 'Não foi possível carregar esta página');
                      }
                    }}
                  />
                </>
              )}
              
              {/* Navegação por toque/click */}
              <div className="absolute inset-0 flex">
                <div 
                  className="w-1/2 cursor-pointer"
                  onClick={paginaAnterior}
                  title="Página anterior"
                />
                <div 
                  className="w-1/2 cursor-pointer"
                  onClick={proximaPagina}
                  title="Próxima página"
                />
              </div>
            </div>
          </div>
        ) : (
          // Modo scroll - formato vertical contínuo e fluido
          <div className="w-full">
            {capitulo.paginas.map((pagina, index) => (
              <div key={pagina.id} className="w-full flex justify-center" data-page={index}>
                <div className="w-full max-w-7xl px-2 sm:px-4 relative">
                  {loadingImages.has(pagina.id) && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center z-10">
                      <div className="text-gray-400 text-sm">Carregando página {pagina.numero}...</div>
                    </div>
                  )}
                  <img
                    src={pagina.imagem.startsWith('/uploads/') ? pagina.imagem : `/uploads/${pagina.imagem}`}
                    alt={`Página ${pagina.numero}`}
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                    style={{ 
                      transform: `scale(${zoom})`,
                      maxHeight: 'none',
                      minHeight: '80vh',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    onLoadStart={() => handleImageStart(pagina.id)}
                    onLoad={() => handleImageLoad(pagina.id)}
                    onError={(e) => {
                      handleImageLoad(pagina.id);
                      console.error('Erro ao carregar imagem:', pagina.imagem);
                      console.error('URL tentada:', e.currentTarget.src);
                      
                      // Tentar URL alternativa para capítulos antigos
                      const alternativeUrl = pagina.imagem.replace('/uploads/', '/api/uploads/');
                      if (alternativeUrl !== e.currentTarget.src) {
                        console.log('🔄 Tentando URL alternativa:', alternativeUrl);
                        e.currentTarget.src = alternativeUrl;
                      } else {
                      info('Erro de Imagem', `Não foi possível carregar a página ${pagina.numero}`);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            
            {/* Botões de navegação no final */}
            <div className="w-full flex justify-center mt-4">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">🎉 Capítulo Concluído!</h3>
                  <p className="text-gray-300">
                    {proximoCapitulo ? 'Pronto para continuar a leitura?' : 'Este foi o último capítulo disponível.'}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/manga/${params.id}`}
                    className="flex-1 bg-gray-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    📖 Voltar ao Mangá
                  </Link>
                  {proximoCapitulo && (
                    <Link
                      href={`/manga/${params.id}/capitulo/${proximoCapitulo.id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-center flex items-center justify-center gap-2"
                    >
                      ➡️ Próximo Capítulo {proximoCapitulo.numero}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles inferiores - apenas desktop */}
      <div className={`hidden sm:block fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-t border-gray-800 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <button
                onClick={paginaAnterior}
                disabled={paginaAtual === 0 || modoLeitura === 'scroll'}
                className="px-2 py-1 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs sm:text-sm transition-colors"
              >
                ← Anterior
              </button>
              
              <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                {modoLeitura === 'pagina' ? (
                  <>
                    <input
                      type="range"
                      min="0"
                      max={totalPaginas - 1}
                      value={paginaAtual}
                      onChange={(e) => setPaginaAtual(parseInt(e.target.value))}
                      className="w-20 sm:w-32"
                    />
                    <span className="text-xs sm:text-sm text-gray-400">
                      {paginaAtual + 1} / {totalPaginas}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm transition-colors"
                    >
                      ↑ Topo
                    </button>
                    <span className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                      Scroll para navegar
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={proximaPagina}
                disabled={paginaAtual === totalPaginas - 1 || modoLeitura === 'scroll'}
                className="hidden sm:block px-2 py-1 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-xs sm:text-sm transition-colors"
              >
                Próxima →
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs sm:text-sm"
              >
                {showControls ? '👁️' : '👁️'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mostrar controles */}
      <div 
        className="fixed inset-0 z-40"
        onClick={() => setShowControls(!showControls)}
        style={{ display: modoLeitura === 'pagina' ? 'block' : 'none' }}
      />
    </div>
  );
}
