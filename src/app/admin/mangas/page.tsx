"use client";

import React, { useState } from "react";

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
  paginas: Pagina[];
  dataPublicacao: string;
}

interface Manga {
  id: number;
  titulo: string;
  autor: string;
  generos: string[];
  status: "em_andamento" | "completo" | "pausado";
  capitulos: Capitulo[];
  visualizacoes: number;
  capa: string;
  dataAdicao: string;
}

const mangasExemplo: Manga[] = [
  {
    id: 1,
    titulo: "One Piece",
    autor: "Eiichiro Oda",
    generos: ["Ação", "Aventura", "Comédia"],
    status: "em_andamento",
    capitulos: [
      {
        id: 1,
        numero: 1095,
        titulo: "O Sonho de Luffy",
        paginas: [
          { id: 1, numero: 1, imagem: "https://via.placeholder.com/800x1200/ff1744/ffffff?text=Página+1" },
          { id: 2, numero: 2, imagem: "https://via.placeholder.com/800x1200/ff1744/ffffff?text=Página+2" },
          { id: 3, numero: 3, imagem: "https://via.placeholder.com/800x1200/ff1744/ffffff?text=Página+3" }
        ],
        dataPublicacao: "2024-01-10"
      }
    ],
    visualizacoes: 2500000,
    capa: "https://via.placeholder.com/200x300/ff1744/ffffff?text=One+Piece",
    dataAdicao: "2024-01-10"
  },
  {
    id: 2,
    titulo: "Attack on Titan",
    autor: "Hajime Isayama",
    generos: ["Ação", "Drama", "Fantasia"],
    status: "completo",
    capitulos: [
      {
        id: 1,
        numero: 139,
        titulo: "Capítulo Final",
        paginas: [
          { id: 1, numero: 1, imagem: "https://via.placeholder.com/800x1200/ff1744/ffffff?text=Página+1" },
          { id: 2, numero: 2, imagem: "https://via.placeholder.com/800x1200/ff1744/ffffff?text=Página+2" }
        ],
        dataPublicacao: "2024-01-15"
      }
    ],
    visualizacoes: 1800000,
    capa: "https://via.placeholder.com/200x300/ff1744/ffffff?text=Attack+on+Titan",
    dataAdicao: "2024-01-15"
  }
];

export default function MangasPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid");
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [formulario, setFormulario] = useState({
    titulo: "",
    autor: "",
    generos: "",
    status: "em_andamento" as "em_andamento" | "completo" | "pausado",
    capa: null as File | null
  });
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  const [capituloAtual, setCapituloAtual] = useState({
    numero: 1,
    titulo: "",
    paginas: [] as File[]
  });
  const [previewPaginas, setPreviewPaginas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Funções de ação dos botões
  const handleEditar = (manga: Manga) => {
    alert(`Editar mangá: ${manga.titulo}\n\nFuncionalidade em desenvolvimento!`);
  };

  const handleDeletar = async (manga: Manga) => {
    if (confirm(`Tem certeza que deseja deletar "${manga.titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        console.log('Tentando deletar mangá ID:', manga.id);
        
        // Testar primeiro o endpoint de teste
        const testResponse = await fetch('/api/test-delete', { method: 'DELETE' });
        console.log('Test DELETE status:', testResponse.status);
        
        // Usar a nova API de delete
        const response = await fetch(`/api/mangas/delete?id=${manga.id}`, {
          method: 'DELETE'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resultado da API:', result);
          alert('Mangá deletado com sucesso!');
          await carregarMangas(); // Recarregar lista
        } else {
          const errorText = await response.text();
          console.error('Erro na resposta:', errorText);
          alert(`Erro ao deletar mangá: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Erro ao deletar mangá:', error);
        alert('Erro ao deletar mangá: ' + (error as Error).message);
      }
    }
  };

  const handleVisualizar = (manga: Manga) => {
    alert(`Visualizar mangá: ${manga.titulo}\n\nCapítulos: ${manga.capitulos?.length || 0}\n\nFuncionalidade em desenvolvimento!`);
  };

  // Função para carregar mangás da API
  const carregarMangas = async () => {
    try {
      setCarregando(true);
      const response = await fetch('/api/mangas');
      if (response.ok) {
        const dados = await response.json();
        
        // Transformar dados da API para o formato esperado pelo frontend
        const mangasFormatados = await Promise.all(
          dados.map(async (manga: any) => {
            // Buscar capítulos completos para cada mangá
            const capitulosResponse = await fetch(`/api/mangas/${manga.id}`);
            if (capitulosResponse.ok) {
              const mangaCompleto = await capitulosResponse.json();
              return {
                id: manga.id,
                titulo: manga.titulo,
                autor: manga.autor || 'Autor não informado',
                generos: manga.generos || [],
                status: manga.status,
                capitulos: mangaCompleto.capitulos || [],
                visualizacoes: manga.visualizacoes || 0,
                capa: manga.capa,
                dataAdicao: manga.dataAdicao
              };
            }
            
            // Fallback se não conseguir buscar capítulos
            return {
              id: manga.id,
              titulo: manga.titulo,
              autor: manga.autor || 'Autor não informado',
              generos: manga.generos || [],
              status: manga.status,
              capitulos: [],
              visualizacoes: manga.visualizacoes || 0,
              capa: manga.capa,
              dataAdicao: manga.data_adicao || manga.dataAdicao
            };
          })
        );
        
        setMangas(mangasFormatados);
      } else {
        console.error('Erro ao carregar mangás');
        // Fallback para dados de exemplo se a API falhar
        setMangas(mangasExemplo);
      }
    } catch (error) {
      console.error('Erro ao carregar mangás:', error);
      // Fallback para dados de exemplo
      setMangas(mangasExemplo);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar mangás ao montar o componente
  React.useEffect(() => {
    carregarMangas();
  }, []);

  const mangasFiltrados = mangas.filter(manga => {
    const matchesTitulo = manga.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                         manga.autor.toLowerCase().includes(filtro.toLowerCase());
    const matchesStatus = statusFiltro === "" || manga.status === statusFiltro;
    return matchesTitulo && matchesStatus;
  });

  const formatarVisualizacoes = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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

  // Função para comprimir imagem
  const comprimirImagem = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem comprimida
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade reduzida
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 10MB antes da compressão)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB.');
        return;
      }

      setFormulario(prev => ({ ...prev, capa: file }));
      
      // Comprimir e criar preview
      try {
        const compressedBase64 = await comprimirImagem(file, 400, 0.7); // Capa menor
        setPreviewCapa(compressedBase64);
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        // Fallback para método original
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewCapa(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePaginasChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validar todos os arquivos
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert('Cada imagem deve ter no máximo 10MB.');
          return;
        }
      }

      setCapituloAtual(prev => ({ ...prev, paginas: files }));
      
      // Comprimir e criar previews
      const previews: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const compressedBase64 = await comprimirImagem(files[i], 600, 0.8); // Páginas um pouco maiores
          previews[i] = compressedBase64;
        } catch (error) {
          console.error('Erro ao comprimir página:', error);
          // Fallback para método original
          const reader = new FileReader();
          reader.onload = (e) => {
            previews[i] = e.target?.result as string;
          };
          reader.readAsDataURL(files[i]);
        }
      }
      
      setPreviewPaginas(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulario.titulo || !formulario.capa || capituloAtual.paginas.length === 0) {
      alert('Por favor, preencha o título, selecione uma capa e adicione pelo menos uma página.');
      return;
    }

    setSalvando(true);
    
    try {
      // Preparar dados para envio
      const mangaData = {
        titulo: formulario.titulo,
        autor: formulario.autor || null,
        generos: formulario.generos.split(',').map(g => g.trim()).filter(g => g),
        status: formulario.status,
        capa: previewCapa,
        capitulo: {
          numero: capituloAtual.numero,
          titulo: capituloAtual.titulo || `Capítulo ${capituloAtual.numero}`,
          paginas: previewPaginas
        }
      };

      // Enviar para API
      const response = await fetch('/api/mangas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mangaData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar mangá');
      }

      const result = await response.json();
      
      // Recarregar lista de mangás
      await carregarMangas();
      
      // Limpar formulário
      setFormulario({
        titulo: "",
        autor: "",
        generos: "",
        status: "em_andamento",
        capa: null
      });
      setCapituloAtual({
        numero: 1,
        titulo: "",
        paginas: []
      });
      setPreviewCapa(null);
      setPreviewPaginas([]);
      setModalAberto(false);
      
      alert('Mangá adicionado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar mangá:', error);
      alert('Erro ao salvar mangá: ' + (error as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFormulario({
      titulo: "",
      autor: "",
      generos: "",
      status: "em_andamento",
      capa: null
    });
    setCapituloAtual({
      numero: 1,
      titulo: "",
      paginas: []
    });
    setPreviewCapa(null);
    setPreviewPaginas([]);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando mangás...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gerenciar Mangás</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Administre todo o catálogo de mangás</p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm md:text-base"
        >
          <span className="mr-2">➕</span>
          <span className="hidden sm:inline">Novo Mangá</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full bg-black/50 border border-red-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <select 
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="bg-black/50 border border-red-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white focus:border-red-500 focus:outline-none text-sm md:text-base flex-1 lg:flex-none"
            >
              <option value="">Todos os status</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="completo">Completo</option>
              <option value="pausado">Pausado</option>
            </select>
            <div className="flex border border-red-500/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setVisualizacao("grid")}
                className={`px-3 md:px-4 py-2 md:py-3 transition-colors text-sm md:text-base ${
                  visualizacao === "grid" 
                    ? "bg-red-500/20 text-red-300" 
                    : "bg-black/50 text-gray-400 hover:text-white"
                }`}
                title="Visualização em grade"
              >
                ⊞
              </button>
              <button
                onClick={() => setVisualizacao("lista")}
                className={`px-3 md:px-4 py-2 md:py-3 transition-colors text-sm md:text-base ${
                  visualizacao === "lista" 
                    ? "bg-red-500/20 text-red-300" 
                    : "bg-black/50 text-gray-400 hover:text-white"
                }`}
                title="Visualização em lista"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Mangás */}
      {visualizacao === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {mangasFiltrados.map((manga) => (
            <div key={manga.id} className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-red-500/20 rounded-2xl overflow-hidden hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="relative">
                <img 
                  src={manga.capa} 
                  alt={manga.titulo}
                  className="w-full h-32 sm:h-40 md:h-48 object-cover"
                />
                <div className="absolute top-1 right-1">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(manga.status)}`}>
                    {getStatusText(manga.status).slice(0, 3)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditar(manga)}
                      className="bg-blue-500/90 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors text-sm"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeletar(manga)}
                      className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg transition-colors text-sm"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                    <button 
                      onClick={() => handleVisualizar(manga)}
                      className="bg-gray-500/90 hover:bg-gray-500 text-white p-1.5 rounded-lg transition-colors text-sm"
                      title="Ver"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2 md:p-3">
                <h3 className="text-white font-bold text-sm md:text-base mb-1 truncate">{manga.titulo}</h3>
                <p className="text-gray-400 text-xs mb-2 truncate">{manga.autor}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(manga.generos || []).slice(0, 1).map((genero, index) => (
                    <span key={index} className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-xs">
                      {genero}
                    </span>
                  ))}
                  {(manga.generos || []).length > 1 && (
                    <span className="bg-gray-500/20 text-gray-300 px-1.5 py-0.5 rounded text-xs">
                      +{(manga.generos || []).length - 1}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>📖 {manga.capitulos?.length || 0}</span>
                  <span>👁️ {formatarVisualizacoes(manga.visualizacoes || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Lista de Mangás */
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-500/10 border-b border-red-500/20">
                <tr>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm">Mangá</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm hidden sm:table-cell">Autor</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm">Status</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm hidden md:table-cell">Capítulos</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm hidden lg:table-cell">Visualizações</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm hidden xl:table-cell">Data</th>
                  <th className="text-left p-2 md:p-4 text-gray-300 font-medium text-xs md:text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mangasFiltrados.map((manga) => (
                  <tr key={manga.id} className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors">
                    <td className="p-2 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <img src={manga.capa} alt={manga.titulo} className="w-8 h-10 md:w-12 md:h-16 object-cover rounded" />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium text-sm md:text-base truncate">{manga.titulo}</div>
                          <div className="text-gray-400 text-xs md:text-sm truncate">{(manga.generos || []).slice(0, 2).join(", ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-gray-300 text-xs md:text-sm hidden sm:table-cell truncate">{manga.autor}</td>
                    <td className="p-2 md:p-4">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(manga.status)}`}>
                        {getStatusText(manga.status)}
                      </span>
                    </td>
                    <td className="p-2 md:p-4 text-gray-300 text-xs md:text-sm hidden md:table-cell">{manga.capitulos?.length || 0}</td>
                    <td className="p-2 md:p-4 text-gray-300 text-xs md:text-sm hidden lg:table-cell">{formatarVisualizacoes(manga.visualizacoes)}</td>
                    <td className="p-2 md:p-4 text-gray-300 text-xs md:text-sm hidden xl:table-cell">{new Date(manga.dataAdicao).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2 md:p-4">
                      <div className="flex gap-1 md:gap-2">
                        <button 
                          onClick={() => handleEditar(manga)}
                          className="text-blue-400 hover:text-blue-300 p-1 md:p-2 hover:bg-blue-500/10 rounded transition-colors text-sm md:text-base"
                          title="Editar mangá"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeletar(manga)}
                          className="text-red-400 hover:text-red-300 p-1 md:p-2 hover:bg-red-500/10 rounded transition-colors text-sm md:text-base"
                          title="Deletar mangá"
                        >
                          🗑️
                        </button>
                        <button 
                          onClick={() => handleVisualizar(manga)}
                          className="text-gray-400 hover:text-gray-300 p-1 md:p-2 hover:bg-gray-500/10 rounded transition-colors text-sm md:text-base"
                          title="Visualizar mangá"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 md:p-6 text-center">
          <div className="text-lg md:text-2xl font-bold text-white">{mangas.length}</div>
          <div className="text-gray-400 text-xs md:text-sm">Total de Mangás</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 md:p-6 text-center">
          <div className="text-lg md:text-2xl font-bold text-green-400">{mangas.filter(m => m.status === 'em_andamento').length}</div>
          <div className="text-gray-400 text-xs md:text-sm">Em Andamento</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 md:p-6 text-center">
          <div className="text-lg md:text-2xl font-bold text-blue-400">{mangas.filter(m => m.status === 'completo').length}</div>
          <div className="text-gray-400 text-xs md:text-sm">Completos</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-3 md:p-6 text-center">
          <div className="text-lg md:text-2xl font-bold text-red-400">{mangas.reduce((acc, m) => acc + (m.capitulos?.length || 0), 0)}</div>
          <div className="text-gray-400 text-xs md:text-sm">Total Capítulos</div>
        </div>
      </div>

      {/* Modal de Novo Mangá */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-black/90 to-red-900/20 border border-red-500/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Adicionar Novo Mangá</h2>
                <button 
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de Capa */}
                <div>
                  <label className="block text-white font-medium mb-2">Capa do Mangá *</label>
                  <div className="border-2 border-dashed border-red-500/30 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors bg-black/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="capa-upload"
                    />
                    <label htmlFor="capa-upload" className="cursor-pointer">
                      {previewCapa ? (
                        <div className="space-y-4">
                          <img 
                            src={previewCapa} 
                            alt="Preview" 
                            className="mx-auto max-h-48 rounded-lg border border-red-500/30"
                          />
                          <p className="text-green-400">✓ Imagem selecionada</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-4xl text-red-500">📷</div>
                          <p className="text-white">Clique para selecionar uma imagem</p>
                          <p className="text-gray-400 text-sm">PNG, JPG, JPEG (máx. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Campos do Formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Título *</label>
                    <input
                      type="text"
                      value={formulario.titulo}
                      onChange={(e) => setFormulario(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                      placeholder="Digite o título do mangá"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Autor</label>
                    <input
                      type="text"
                      value={formulario.autor}
                      onChange={(e) => setFormulario(prev => ({ ...prev, autor: e.target.value }))}
                      className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                      placeholder="Nome do autor (opcional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Gêneros</label>
                  <input
                    type="text"
                    value={formulario.generos}
                    onChange={(e) => setFormulario(prev => ({ ...prev, generos: e.target.value }))}
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Ação, Aventura, Comédia (separados por vírgula)"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Status</label>
                  <select
                    value={formulario.status}
                    onChange={(e) => setFormulario(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                  >
                    <option value="em_andamento">Em Andamento</option>
                    <option value="completo">Completo</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>

                {/* Seção do Capítulo */}
                <div className="border-t border-red-500/20 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">📖 Primeiro Capítulo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Número do Capítulo</label>
                      <input
                        type="number"
                        value={capituloAtual.numero}
                        onChange={(e) => setCapituloAtual(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                        className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                        placeholder="1"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Título do Capítulo</label>
                      <input
                        type="text"
                        value={capituloAtual.titulo}
                        onChange={(e) => setCapituloAtual(prev => ({ ...prev, titulo: e.target.value }))}
                        className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
                        placeholder="Ex: O início da jornada"
                      />
                    </div>
                  </div>

                  {/* Upload de Páginas */}
                  <div>
                    <label className="block text-white font-medium mb-2">Páginas do Capítulo *</label>
                    <div className="border-2 border-dashed border-red-500/30 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors bg-black/20">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePaginasChange}
                        className="hidden"
                        id="paginas-upload"
                      />
                      <label htmlFor="paginas-upload" className="cursor-pointer">
                        {previewPaginas.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {previewPaginas.map((preview, index) => (
                                <img 
                                  key={index}
                                  src={preview} 
                                  alt={`Página ${index + 1}`}
                                  className="w-full h-32 object-cover rounded border border-red-500/30"
                                />
                              ))}
                            </div>
                            <p className="text-green-400">✓ {previewPaginas.length} página(s) selecionada(s)</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-4xl text-red-500">📄</div>
                            <p className="text-white">Clique para selecionar as páginas</p>
                            <p className="text-gray-400 text-sm">PNG, JPG, JPEG (máx. 5MB cada)</p>
                            <p className="text-gray-400 text-xs">Você pode selecionar múltiplas imagens</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center ${
                      salvando 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } text-white`}
                  >
                    {salvando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      'Adicionar Mangá'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}