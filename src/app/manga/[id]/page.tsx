"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import FavoritoButton from '@/components/FavoritoButton';
import MangaImageHybrid from '@/components/MangaImageHybrid';
import Link from 'next/link';
import { formatDateInSaoPaulo } from '@/utils/dateFormat';
import { useViews } from '@/hooks/useViews';

interface Capitulo {
  id: number;
  numero: number;
  titulo: string;
  data_publicacao: string;
  paginas: Pagina[];
}

interface Pagina {
  id: number;
  numero: number;
  imagem: string;
  legenda?: string;
}

interface Manga {
  id: number;
  titulo: string;
  autor: string;
  generos: string[];
  status: string;
  capa: string;
  visualizacoes: number;
  dataAdicao: string;
  descricao?: string;
  capitulos: Capitulo[];
}

export default function MangaPage() {
  const params = useParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook para gerenciar visualizações
  const { visualizacoes, loading: viewsLoading, error: viewsError } = useViews(
    manga?.id || 0
  );

  useEffect(() => {
    const carregarManga = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados reais da API (forçar reload sem cache)
        const response = await fetch(`/api/mangas/${params.id}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Mangá não encontrado');
          }
          throw new Error('Erro ao carregar mangá');
        }
        
        const mangaData = await response.json();
        
        
        // Converter formato da API para o formato do frontend
        const manga: Manga = {
          id: mangaData.id,
          titulo: mangaData.titulo,
          autor: mangaData.autor || 'Autor Desconhecido',
          generos: mangaData.generos || [],
          status: mangaData.status,
          capa: mangaData.capa || '/images/mangas/placeholder.jpg',
          visualizacoes: mangaData.visualizacoes || 0,
          dataAdicao: mangaData.data_adicao || mangaData.dataAdicao || new Date().toISOString(),
          descricao: mangaData.descricao || `Descrição de ${mangaData.titulo}`,
          capitulos: mangaData.capitulos || []
        };
        
        setManga(manga);
      } catch (error) {
        console.error('Erro ao carregar mangá:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      carregarManga();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mangá...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">❌</div>
          <div className="text-white text-xl mb-4">{error}</div>
          <Link 
            href="/"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Mangá não encontrado</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "completo": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "pausado": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em_andamento": return "Em Andamento";
      case "completo": return "Completo";
      case "pausado": return "Pausado";
      default: return status;
    }
  };

  const getUltimaAtualizacao = (capitulos: Capitulo[], dataAdicao: string) => {
    if (capitulos.length === 0) return null;
    
    // Ordenar capítulos por data de publicação (mais recente primeiro)
    const capitulosOrdenados = [...capitulos].sort((a, b) => 
      new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime()
    );
    
    const ultimaDataCapitulo = new Date(capitulosOrdenados[0].data_publicacao);
    const dataAdicaoManga = new Date(dataAdicao);
    
    // Se a data do capítulo for anterior à data de adição, usar a data de adição
    if (ultimaDataCapitulo < dataAdicaoManga) {
      return dataAdicaoManga;
    }
    
    return ultimaDataCapitulo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Voltar ao início
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagem e informações básicas */}
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden">
              <div className="w-full h-96">
                <MangaImageHybrid 
                  titulo={manga.titulo}
                  capa={manga.capa}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-2">{manga.titulo}</h1>
                <p className="text-gray-400 mb-4">por {manga.autor}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {manga.generos.map((genero, index) => (
                    <span 
                      key={index}
                      className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/30"
                    >
                      {genero}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(manga.status)}`}>
                    {getStatusText(manga.status)}
                  </span>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span>👁️ {viewsLoading ? 'Carregando...' : visualizacoes.toLocaleString()}</span>
                    <span>📄 {manga.capitulos.reduce((total, cap) => total + cap.paginas.length, 0)} páginas</span>
                  </div>
                </div>

                {/* Botão de Favoritos */}
                <div className="mb-4">
                  <FavoritoButton 
                    mangaId={manga.id}
                    mangaTitulo={manga.titulo}
                    className="w-full"
                    showText={true}
                  />
                </div>

                <div className="text-gray-400 text-sm space-y-1">
                  <div>Adicionado em {(() => {
                    const data = new Date(manga.dataAdicao);
                    return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
                  })()}</div>
                  {getUltimaAtualizacao(manga.capitulos, manga.dataAdicao) && (
                    <div>
                      Última atualização: {(() => {
                        const data = getUltimaAtualizacao(manga.capitulos, manga.dataAdicao)!;
                        return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Sobre</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {manga.descricao || "Descrição não disponível."}
              </p>

              <h3 className="text-lg font-bold text-white mb-4">
                Capítulos ({manga.capitulos.length})
              </h3>
              <div className="space-y-2">
                {manga.capitulos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">📚</div>
                    <p className="text-gray-400">Nenhum capítulo disponível ainda</p>
                  </div>
                ) : (
                  manga.capitulos.map((capitulo) => (
                    <Link 
                      key={capitulo.id}
                      href={`/manga/${manga.id}/capitulo/${capitulo.id}`}
                      className="block bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg p-4 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">
                            {capitulo.titulo || `Capítulo ${capitulo.numero}`}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Publicado em {(() => {
                            
                              return formatDateInSaoPaulo(capitulo.data_publicacao);
                              
                            })()}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {capitulo.paginas.length} {capitulo.paginas.length === 1 ? 'página' : 'páginas'}
                          </p>
                        </div>
                        <span className="text-gray-400 text-sm">📖</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
