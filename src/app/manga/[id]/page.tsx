"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import FavoritoButton from '@/components/FavoritoButton';
import Link from 'next/link';

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
}

export default function MangaPage() {
  const params = useParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados do mangá
    // Em uma implementação real, você faria uma chamada para a API
    const mockManga: Manga = {
      id: Number(params.id),
      titulo: "One Piece",
      autor: "Eiichiro Oda",
      generos: ["Ação", "Aventura", "Comédia"],
      status: "em_andamento",
      capa: "https://via.placeholder.com/400x600/ff1744/ffffff?text=One+Piece",
      visualizacoes: 1500000,
      dataAdicao: "2024-01-01",
      descricao: "A história de Monkey D. Luffy, um jovem que sonha em se tornar o Rei dos Piratas."
    };

    setTimeout(() => {
      setManga(mockManga);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mangá...</div>
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
              <img 
                src={manga.capa} 
                alt={manga.titulo}
                className="w-full h-96 object-cover"
              />
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
                  <span className="text-gray-400 text-sm">
                    👁️ {manga.visualizacoes.toLocaleString()} visualizações
                  </span>
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

                <div className="text-gray-400 text-sm">
                  Adicionado em {new Date(manga.dataAdicao).toLocaleDateString('pt-BR')}
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

              <h3 className="text-lg font-bold text-white mb-4">Capítulos</h3>
              <div className="space-y-2">
                {/* Simular capítulos */}
                {[1, 2, 3, 4, 5].map((capitulo) => (
                  <div 
                    key={capitulo}
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg p-4 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Capítulo {capitulo}</h4>
                        <p className="text-gray-400 text-sm">Publicado há {capitulo} dias</p>
                      </div>
                      <span className="text-gray-400 text-sm">📖</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
