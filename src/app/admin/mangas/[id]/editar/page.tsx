"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import PageManager from '@/components/PageManager';
import EnhancedPageManager from '@/components/EnhancedPageManager';

interface Pagina {
  id: number;
  numero: number;
  imagem: string;
  legenda?: string;
  created_at?: string;
  updated_at?: string;
  editado_por?: string;
}

interface PaginaUpload {
  id: string;
  file: File;
  preview: string;
  numero: number;
  legenda?: string;
}

interface Capitulo {
  id: number;
  numero: number;
  titulo: string;
  paginas: Pagina[];
  data_publicacao: string;
  created_at?: string;
  updated_at?: string;
  editado_por?: string;
}

interface Manga {
  id: number;
  titulo: string;
  autor: string;
  generos: string[];
  status: "EM_ANDAMENTO" | "COMPLETO" | "PAUSADO";
  capitulos: Capitulo[];
  visualizacoes: number;
  capa: string;
  data_adicao: string;
  created_at?: string;
  updated_at?: string;
  editado_por?: string;
}

export default function EditarMangaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error, warning, info } = useNotificationContext();
  const { user, isAdmin, isLoading } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [capituloSelecionado, setCapituloSelecionado] = useState<number | null>(null);
  const [paginasEditando, setPaginasEditando] = useState<Pagina[]>([]);
  const [ordemPaginas, setOrdemPaginas] = useState<number[]>([]);
  
  // Estados para modal de novo capítulo
  const [modalNovoCapitulo, setModalNovoCapitulo] = useState(false);
  
  // Debug: Log quando modal muda
  useEffect(() => {
    console.log('🔍 Debug - Modal novo capítulo:', modalNovoCapitulo);
  }, [modalNovoCapitulo]);
  const [novoCapitulo, setNovoCapitulo] = useState({
    numero: 1,
    titulo: "",
    paginas: [] as PaginaUpload[]
  });
  const [salvandoCapitulo, setSalvandoCapitulo] = useState(false);

  // Estados para modal de adicionar páginas
  const [modalAdicionarPaginas, setModalAdicionarPaginas] = useState(false);
  const [paginasParaAdicionar, setPaginasParaAdicionar] = useState<PaginaUpload[]>([]);
  const [salvandoPaginas, setSalvandoPaginas] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, isAdmin, isLoading, router]);

  // Carregar dados do mangá
  useEffect(() => {
    const carregarManga = async () => {
      try {
        setCarregando(true);
        const response = await fetch(`/api/mangas/${id}`);
        
        if (!response.ok) {
          throw new Error('Mangá não encontrado');
        }
        
        const dados = await response.json();
        setManga(dados);
        
        // Selecionar primeiro capítulo por padrão
        if (dados.capitulos && dados.capitulos.length > 0) {
          setCapituloSelecionado(dados.capitulos[0].id);
          setPaginasEditando(dados.capitulos[0].paginas || []);
          setOrdemPaginas(dados.capitulos[0].paginas?.map((p: Pagina) => p.id) || []);
        }
      } catch (err) {
        console.error('Erro ao carregar mangá:', err);
        error('Erro ao Carregar', 'Falha ao carregar os dados do mangá.');
        router.push('/admin/mangas');
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      carregarManga();
    }
  }, [id, router, error]);

  // Atualizar páginas quando capítulo selecionado mudar
  useEffect(() => {
    if (manga && capituloSelecionado) {
      const capitulo = manga.capitulos.find(c => c.id === capituloSelecionado);
      if (capitulo) {
        setPaginasEditando(capitulo.paginas || []);
        setOrdemPaginas(capitulo.paginas?.map(p => p.id) || []);
      }
    }
  }, [capituloSelecionado, manga]);

  const handleSalvarOrdem = async () => {
    if (!capituloSelecionado || ordemPaginas.length === 0) return;

    setSalvando(true);
    try {
      const response = await fetch(`/api/mangas/${id}/capitulo/${capituloSelecionado}/reordenar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ordemPaginas: ordemPaginas,
          editado_por: user?.nome || user?.email || 'Admin',
          editado_em: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar ordem');
      }

      success('Ordem Salva', 'A ordem das páginas foi atualizada com sucesso!');
      
      // Recarregar dados
      const mangaResponse = await fetch(`/api/mangas/${id}`);
      if (mangaResponse.ok) {
        const dados = await mangaResponse.json();
        setManga(dados);
      }
    } catch (err) {
      console.error('Erro ao salvar ordem:', err);
      error('Erro ao Salvar', 'Falha ao salvar a ordem das páginas.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirPagina = async (paginaId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return;

    setSalvando(true);
    try {
      const response = await fetch(`/api/mangas/${id}/pagina/${paginaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editado_por: user?.nome || user?.email || 'Admin',
          editado_em: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir página');
      }

      success('Página Excluída', 'A página foi excluída com sucesso!');
      
      // Recarregar dados
      const mangaResponse = await fetch(`/api/mangas/${id}`);
      if (mangaResponse.ok) {
        const dados = await mangaResponse.json();
        setManga(dados);
        
        // Atualizar páginas do capítulo selecionado
        const capitulo = dados.capitulos.find((c: Capitulo) => c.id === capituloSelecionado);
        if (capitulo) {
          setPaginasEditando(capitulo.paginas || []);
          setOrdemPaginas(capitulo.paginas?.map((p: Pagina) => p.id) || []);
        }
      }
    } catch (err) {
      console.error('Erro ao excluir página:', err);
      error('Erro ao Excluir', 'Falha ao excluir a página.');
    } finally {
      setSalvando(false);
    }
  };

  const handleMoverPagina = (paginaId: number, direcao: 'up' | 'down') => {
    const index = ordemPaginas.indexOf(paginaId);
    if (index === -1) return;

    const novaOrdem = [...ordemPaginas];
    
    if (direcao === 'up' && index > 0) {
      [novaOrdem[index], novaOrdem[index - 1]] = [novaOrdem[index - 1], novaOrdem[index]];
    } else if (direcao === 'down' && index < novaOrdem.length - 1) {
      [novaOrdem[index], novaOrdem[index + 1]] = [novaOrdem[index + 1], novaOrdem[index]];
    }
    
    setOrdemPaginas(novaOrdem);
  };

  // Função para ordenar páginas por nome
  const handleOrdenarPaginasPorNome = async () => {
    if (!manga || !capituloAtual || !capituloAtual.paginas || capituloAtual.paginas.length === 0) {
      warning('Nenhuma Página', 'Não há páginas para ordenar neste capítulo.');
      return;
    }

    try {
      // Ordenar páginas por nome do arquivo (assumindo que o nome está na URL da imagem)
      const paginasOrdenadas = [...capituloAtual.paginas].sort((a, b) => {
        const nomeA = a.imagem.split('/').pop() || '';
        const nomeB = b.imagem.split('/').pop() || '';
        return nomeA.localeCompare(nomeB, undefined, { numeric: true, sensitivity: 'base' });
      });

      // Renumerar as páginas
      const paginasRenumeradas = paginasOrdenadas.map((pagina, index) => ({
        ...pagina,
        numero: index + 1
      }));

      // Salvar nova ordem no banco
      const response = await fetch(`/api/mangas/${manga.id}/capitulo/${capituloAtual.id}/reordenar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paginas: paginasRenumeradas.map(p => ({ id: p.id, numero: p.numero }))
        }),
      });

      if (response.ok) {
        // Atualizar estado local do mangá
        setManga(prev => ({
          ...prev!,
          capitulos: prev!.capitulos.map(c => 
            c.id === capituloAtual.id 
              ? { ...c, paginas: paginasRenumeradas }
              : c
          )
        }));
        
        success('Páginas Ordenadas', 'As páginas foram ordenadas por nome do arquivo.');
      } else {
        throw new Error('Falha ao salvar ordenação');
      }
    } catch (err) {
      console.error('Erro ao ordenar páginas:', err);
      error('Erro ao Ordenar', 'Falha ao ordenar as páginas por nome.');
    }
  };

  // Função para excluir capítulo
  const handleExcluirCapitulo = async (capituloId: number) => {
    if (!manga) return;
    
    const capitulo = manga.capitulos.find(c => c.id === capituloId);
    if (!capitulo) return;

    if (!confirm(`Tem certeza que deseja excluir o Capítulo ${capitulo.numero}?\n\nEsta ação não pode ser desfeita e todas as páginas serão removidas.`)) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/mangas/${manga.id}/capitulo/${capituloId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Atualizar estado local
        setManga(prev => ({
          ...prev!,
          capitulos: prev!.capitulos.filter(c => c.id !== capituloId)
        }));

        // Se o capítulo excluído era o selecionado, limpar seleção
        if (capituloSelecionado === capituloId) {
          setCapituloSelecionado(null);
        }

        success('Capítulo Excluído', `O Capítulo ${capitulo.numero} foi excluído com sucesso.`);
      } else {
        throw new Error('Falha ao excluir capítulo');
      }
    } catch (err) {
      console.error('Erro ao excluir capítulo:', err);
      error('Erro ao Excluir', 'Falha ao excluir o capítulo.');
    }
  };

  // Funções para novo capítulo
  const handleAbrirModalNovoCapitulo = () => {
    console.log('🔍 Debug - Abrindo modal de novo capítulo');
    console.log('Mangá:', manga);
    
    if (!manga) {
      console.log('❌ Mangá não encontrado');
      return;
    }
    
    // Definir próximo número de capítulo
    const proximoNumero = Math.max(...manga.capitulos.map(c => c.numero)) + 1;
    console.log('📊 Próximo número de capítulo:', proximoNumero);
    
    setNovoCapitulo({
      numero: proximoNumero,
      titulo: `Capítulo ${proximoNumero}`, // Título padrão
      paginas: []
    });
    setModalNovoCapitulo(true);
    console.log('✅ Modal aberto');
  };

  const handleFecharModalNovoCapitulo = () => {
    setModalNovoCapitulo(false);
    setNovoCapitulo({
      numero: 1,
      titulo: "",
      paginas: []
    });
  };

  const handlePaginasNovoCapituloChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validar todos os arquivos
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          warning('Arquivo Inválido', 'Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          warning('Arquivo Muito Grande', 'Cada imagem deve ter no máximo 10MB.');
          return;
        }
      }

      // Criar objetos PaginaUpload com previews
      const paginasComPreview: PaginaUpload[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const compressedBase64 = await comprimirImagem(files[i], 600, 0.8);
          paginasComPreview.push({
            id: `pagina_${Date.now()}_${i}`,
            file: files[i],
            preview: compressedBase64,
            numero: novoCapitulo.paginas.length + i + 1,
            legenda: ''
          });
        } catch (err) {
          console.error('Erro ao comprimir página:', err);
          // Fallback para método original
          const reader = new FileReader();
          reader.onload = (e) => {
            paginasComPreview.push({
              id: `pagina_${Date.now()}_${i}`,
              file: files[i],
              preview: e.target?.result as string,
              numero: novoCapitulo.paginas.length + i + 1,
              legenda: ''
            });
          };
          reader.readAsDataURL(files[i]);
        }
      }
      
      setNovoCapitulo(prev => ({ 
        ...prev, 
        paginas: [...prev.paginas, ...paginasComPreview]
      }));
    }
  };

  const handlePaginasNovoCapituloUpdate = (novasPaginas: PaginaUpload[]) => {
    setNovoCapitulo(prev => ({ ...prev, paginas: novasPaginas }));
  };

  const handleRemovePaginaNovoCapitulo = (id: string) => {
    setNovoCapitulo(prev => ({
      ...prev,
      paginas: prev.paginas.filter(p => p.id !== id)
    }));
  };

  const handleUpdateLegendaNovoCapitulo = (id: string, legenda: string) => {
    setNovoCapitulo(prev => ({
      ...prev,
      paginas: prev.paginas.map(p => 
        p.id === id ? { ...p, legenda } : p
      )
    }));
  };

  const handleSalvarNovoCapitulo = async () => {
    console.log('🔍 Debug - Iniciando salvamento do capítulo');
    console.log('Mangá ID:', manga?.id);
    console.log('Novo capítulo:', novoCapitulo);
    console.log('Dados detalhados:', {
      manga: !!manga,
      titulo: novoCapitulo.titulo,
      tituloLength: novoCapitulo.titulo?.length,
      tituloTrimmed: novoCapitulo.titulo?.trim(),
      paginas: novoCapitulo.paginas.length,
      numero: novoCapitulo.numero
    });
    
    // Validação detalhada
    if (!manga) {
      console.log('❌ Mangá não encontrado');
      error('Erro', 'Mangá não encontrado.');
      return;
    }
    
    if (!novoCapitulo.titulo || novoCapitulo.titulo.trim() === '') {
      console.log('❌ Título inválido:', novoCapitulo.titulo);
      error('Dados Incompletos', 'Por favor, preencha o título do capítulo.');
      return;
    }
    
    // Autor é opcional, então não validamos
    
    if (novoCapitulo.paginas.length === 0) {
      console.log('❌ Nenhuma página adicionada');
      error('Dados Incompletos', 'Por favor, adicione pelo menos uma página.');
      return;
    }
    
    console.log('✅ Validação passou - Salvando capítulo');

    setSalvandoCapitulo(true);
    
    try {
      const requestData = {
        numero: novoCapitulo.numero,
        titulo: novoCapitulo.titulo,
        paginas: novoCapitulo.paginas.map(p => ({
          preview: p.preview,
          legenda: p.legenda || `Página ${p.numero}`
        })),
        editado_por: user?.nome || user?.email || 'Admin',
        editado_em: new Date().toISOString()
      };
      
      // Log removido por segurança - não expor dados sensíveis
      
      const response = await fetch(`/api/mangas/${manga.id}/capitulo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // Log removido por segurança
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Falha ao salvar capítulo: ${response.status} - ${errorText}`);
      }

      success('Capítulo Adicionado', 'O novo capítulo foi adicionado com sucesso!');
      
      // Recarregar dados do mangá
      const mangaResponse = await fetch(`/api/mangas/${manga.id}`);
      if (mangaResponse.ok) {
        const dados = await mangaResponse.json();
        setManga(dados);
        
        // Selecionar o novo capítulo
        const novoCap = dados.capitulos.find((c: Capitulo) => c.numero === novoCapitulo.numero);
        if (novoCap) {
          setCapituloSelecionado(novoCap.id);
          setPaginasEditando(novoCap.paginas || []);
          setOrdemPaginas(novoCap.paginas?.map((p: Pagina) => p.id) || []);
        }
      }
      
      handleFecharModalNovoCapitulo();
      
    } catch (err) {
      console.error('Erro ao salvar capítulo:', err);
      error('Erro ao Salvar', 'Falha ao adicionar o capítulo.');
    } finally {
      setSalvandoCapitulo(false);
    }
  };

  // Funções para adicionar páginas ao capítulo existente
  const handleAbrirModalAdicionarPaginas = () => {
    if (!capituloSelecionado) {
      warning('Selecione um Capítulo', 'Por favor, selecione um capítulo primeiro.');
      return;
    }
    
    setPaginasParaAdicionar([]);
    setModalAdicionarPaginas(true);
  };

  const handleFecharModalAdicionarPaginas = () => {
    setModalAdicionarPaginas(false);
    setPaginasParaAdicionar([]);
  };

  const handlePaginasAdicionarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validar todos os arquivos
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          warning('Arquivo Inválido', 'Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          warning('Arquivo Muito Grande', 'Cada imagem deve ter no máximo 10MB.');
          return;
        }
      }

      // Criar objetos PaginaUpload com previews
      const paginasComPreview: PaginaUpload[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const compressedBase64 = await comprimirImagem(files[i], 600, 0.8);
          paginasComPreview.push({
            id: `pagina_${Date.now()}_${i}`,
            file: files[i],
            preview: compressedBase64,
            numero: paginasParaAdicionar.length + i + 1,
            legenda: ''
          });
        } catch (err) {
          console.error('Erro ao comprimir página:', err);
          // Fallback para método original
          const reader = new FileReader();
          reader.onload = (e) => {
            paginasComPreview.push({
              id: `pagina_${Date.now()}_${i}`,
              file: files[i],
              preview: e.target?.result as string,
              numero: paginasParaAdicionar.length + i + 1,
              legenda: ''
            });
          };
          reader.readAsDataURL(files[i]);
        }
      }
      
      setPaginasParaAdicionar(prev => [...prev, ...paginasComPreview]);
    }
  };

  const handlePaginasAdicionarUpdate = (novasPaginas: PaginaUpload[]) => {
    setPaginasParaAdicionar(novasPaginas);
  };

  const handleRemovePaginaAdicionar = (id: string) => {
    setPaginasParaAdicionar(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateLegendaAdicionar = (id: string, legenda: string) => {
    setPaginasParaAdicionar(prev => prev.map(p => 
      p.id === id ? { ...p, legenda } : p
    ));
  };

  const handleSalvarPaginasAdicionar = async () => {
    if (!manga || !capituloSelecionado) {
      error('Erro', 'Dados do capítulo não encontrados.');
      return;
    }

    if (paginasParaAdicionar.length === 0) {
      warning('Nenhuma Página', 'Por favor, adicione pelo menos uma página.');
      return;
    }

    setSalvandoPaginas(true);
    
    try {
      const requestData = {
        paginas: paginasParaAdicionar.map(p => ({
          preview: p.preview,
          legenda: p.legenda || `Página ${p.numero}`
        })),
        editado_por: user?.nome || user?.email || 'Admin',
        editado_em: new Date().toISOString()
      };
      
      const response = await fetch(`/api/mangas/${manga.id}/capitulo/${capituloSelecionado}/adicionar-paginas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao adicionar páginas: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      success('Páginas Adicionadas', result.message);
      
      // Recarregar dados do mangá
      const mangaResponse = await fetch(`/api/mangas/${manga.id}`);
      if (mangaResponse.ok) {
        const dados = await mangaResponse.json();
        setManga(dados);
        
        // Atualizar páginas do capítulo selecionado
        const capitulo = dados.capitulos.find((c: Capitulo) => c.id === capituloSelecionado);
        if (capitulo) {
          setPaginasEditando(capitulo.paginas || []);
          setOrdemPaginas(capitulo.paginas?.map((p: Pagina) => p.id) || []);
        }
      }
      
      handleFecharModalAdicionarPaginas();
      
    } catch (err) {
      console.error('Erro ao adicionar páginas:', err);
      error('Erro ao Adicionar', 'Falha ao adicionar as páginas.');
    } finally {
      setSalvandoPaginas(false);
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

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não é admin, não renderizar nada (será redirecionado)
  if (!user || !isAdmin) {
    return null;
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando mangá...</p>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="text-center py-8">
        <p className="text-white text-lg">Mangá não encontrado</p>
        <button 
          onClick={() => router.push('/admin/mangas')}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Voltar para Mangás
        </button>
      </div>
    );
  }

  const capituloAtual = manga.capitulos.find(c => c.id === capituloSelecionado);
  const paginasOrdenadas = ordemPaginas.map(id => 
    paginasEditando.find(p => p.id === id)
  ).filter(Boolean) as Pagina[];

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Editar Mangá</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base truncate">{manga.titulo}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => router.push('/admin/mangas')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
          >
            ← Voltar
          </button>
          <button 
            onClick={handleSalvarOrdem}
            disabled={salvando}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {salvando ? 'Salvando...' : '💾 Salvar Ordem'}
          </button>
        </div>
      </div>

      {/* Informações do Mangá */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <img src={manga.capa} alt={manga.titulo} className="w-16 h-20 object-cover rounded flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm sm:text-base truncate">{manga.titulo}</h3>
              <p className="text-gray-400 text-xs sm:text-sm truncate">{manga.autor}</p>
              <p className="text-gray-400 text-xs truncate">
                {manga.generos?.join(', ')} • {manga.capitulos.length} capítulos
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            <p><strong>Status:</strong> {manga.status}</p>
            <p><strong>Visualizações:</strong> {manga.visualizacoes || 0}</p>
            <p><strong>Adicionado em:</strong> {formatarData(manga.data_adicao)}</p>
          </div>
          
          <div className="text-sm text-gray-300">
            {manga.editado_por && (
              <p><strong>Última edição por:</strong> {manga.editado_por}</p>
            )}
            {manga.updated_at && (
              <p><strong>Última edição em:</strong> {formatarData(manga.updated_at)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Seletor de Capítulos */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-bold text-white">📖 Selecionar Capítulo</h3>
          <button
            onClick={handleAbrirModalNovoCapitulo}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <span>➕</span>
            <span>Novo Capítulo</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {manga.capitulos.map((capitulo) => (
            <div
              key={capitulo.id}
              className={`relative p-2 sm:p-3 rounded-lg border transition-all ${
                capituloSelecionado === capitulo.id
                  ? 'bg-red-500/20 border-red-500 text-white'
                  : 'bg-black/50 border-red-500/30 text-gray-300 hover:border-red-500/50'
              }`}
            >
              <button
                onClick={() => setCapituloSelecionado(capitulo.id)}
                className="w-full text-center min-h-[60px] flex flex-col justify-center"
              >
                <div className="font-bold text-xs sm:text-sm">Cap. {capitulo.numero}</div>
                <div className="text-xs text-gray-400 truncate mt-1">{capitulo.titulo}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {capitulo.paginas?.length || 0} páginas
                </div>
              </button>
              
              {/* Botão de excluir capítulo */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExcluirCapitulo(capitulo.id);
                }}
                className="absolute top-1 right-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 p-1 rounded text-xs transition-colors"
                title="Excluir capítulo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor de Páginas */}
      {capituloAtual && (
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                📄 Páginas do Capítulo {capituloAtual.numero}
              </h3>
              <div className="text-sm text-gray-400">
                {paginasOrdenadas.length} página(s) • 
                {capituloAtual.editado_por && ` Editado por: ${capituloAtual.editado_por}`}
                {capituloAtual.updated_at && ` em ${formatarData(capituloAtual.updated_at)}`}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleOrdenarPaginasPorNome}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                title="Ordenar páginas por nome do arquivo"
              >
                <span>📝</span>
                <span>Ordenar por Nome</span>
              </button>
              <button
                onClick={handleAbrirModalAdicionarPaginas}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                title="Adicionar páginas ao capítulo"
              >
                <span>➕</span>
                <span>Adicionar Páginas</span>
              </button>
            </div>
          </div>

          {paginasOrdenadas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Nenhuma página encontrada neste capítulo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {paginasOrdenadas.map((pagina, index) => (
                <div key={pagina.id} className="bg-black/50 border border-red-500/20 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={pagina.imagem} 
                      alt={`Página ${pagina.numero}`}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs font-bold">
                      #{index + 1}
                    </div>
                    <div className="absolute top-1 right-1 bg-red-500/90 text-white px-1 py-0.5 rounded text-xs">
                      Página {pagina.numero}
                    </div>
                  </div>
                  
                  <div className="p-2 sm:p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-xs sm:text-sm font-medium truncate">
                        Página {pagina.numero}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoverPagina(pagina.id, 'up')}
                          disabled={index === 0}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoverPagina(pagina.id, 'down')}
                          disabled={index === paginasOrdenadas.length - 1}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleExcluirPagina(pagina.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-1 rounded text-xs transition-colors"
                          title="Excluir página"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {pagina.legenda && (
                      <p className="text-gray-400 text-xs mb-2 truncate">{pagina.legenda}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {pagina.editado_por && (
                        <p>Editado por: {pagina.editado_por}</p>
                      )}
                      {pagina.updated_at && (
                        <p>Em: {formatarData(pagina.updated_at)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h4 className="text-blue-300 font-bold mb-2">💡 Instruções</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Use as setas ↑↓ para reordenar as páginas</li>
          <li>• Clique em 🗑️ para excluir uma página</li>
          <li>• Clique em "Salvar Ordem" para aplicar as mudanças</li>
          <li>• As páginas são ordenadas numericamente por padrão</li>
          <li>• Use "Novo Capítulo" para adicionar capítulos</li>
        </ul>
      </div>

      {/* Modal de Novo Capítulo */}
      {modalNovoCapitulo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-600/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">📖 Adicionar Novo Capítulo</h2>
                  <p className="text-gray-400">Crie um novo capítulo para o mangá</p>
                </div>
                <button 
                  onClick={handleFecharModalNovoCapitulo}
                  className="text-gray-400 hover:text-white text-3xl transition-colors p-2 hover:bg-gray-700/50 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-8">
                {/* Informações do Capítulo */}
                <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">📝 Informações do Capítulo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-white font-medium mb-3">Número do Capítulo</label>
                    <input
                      type="number"
                      value={novoCapitulo.numero}
                      onChange={(e) => setNovoCapitulo(prev => ({ ...prev, numero: parseInt(e.target.value) || 1 }))}
                        className="w-full bg-gray-700/50 border border-gray-500/30 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div>
                      <label className="block text-white font-medium mb-3">Título do Capítulo *</label>
                    <input
                      type="text"
                      value={novoCapitulo.titulo}
                      onChange={(e) => {
                        console.log('🔍 Debug - Título alterado:', e.target.value);
                        setNovoCapitulo(prev => ({ ...prev, titulo: e.target.value }));
                      }}
                        className="w-full bg-gray-700/50 border border-gray-500/30 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Ex: O início da jornada"
                      required
                    />
                    {!novoCapitulo.titulo && (
                        <p className="text-red-400 text-sm mt-2">⚠️ Título é obrigatório</p>
                    )}
                    </div>
                  </div>
                </div>

                {/* Upload de Páginas */}
                <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">📄 Páginas do Capítulo</h3>
                  
                  {/* Área de upload moderna */}
                  <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center hover:border-blue-500/50 transition-all duration-300 bg-blue-500/5 hover:bg-blue-500/10 mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePaginasNovoCapituloChange}
                      className="hidden"
                      id="novo-capitulo-paginas-upload"
                    />
                    <label htmlFor="novo-capitulo-paginas-upload" className="cursor-pointer block">
                      <div className="space-y-4">
                        <div className="text-6xl text-blue-500">📄</div>
                        <div>
                          <p className="text-white text-lg font-medium">
                          {novoCapitulo.paginas.length > 0 
                            ? 'Adicionar mais páginas' 
                            : 'Clique para selecionar as páginas'
                          }
                        </p>
                          <p className="text-gray-400 text-sm mt-2">PNG, JPG, JPEG, WEBP (máx. 10MB cada)</p>
                          <p className="text-gray-500 text-xs mt-1">Você pode selecionar múltiplas imagens</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Gerenciador de Páginas Moderno */}
                  {novoCapitulo.paginas.length > 0 && (
                    <EnhancedPageManager
                      paginas={novoCapitulo.paginas}
                      onPaginasChange={handlePaginasNovoCapituloUpdate}
                      onRemove={handleRemovePaginaNovoCapitulo}
                      onUpdateLegenda={handleUpdateLegendaNovoCapitulo}
                      onAddMore={(newPaginas) => {
                        setNovoCapitulo(prev => ({
                          ...prev,
                          paginas: [...prev.paginas, ...newPaginas]
                        }));
                      }}
                    />
                  )}
                </div>

                {/* Status dos campos obrigatórios */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h4 className="text-green-300 font-bold mb-4 text-lg">📋 Status dos Campos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${novoCapitulo.titulo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      <span className="text-2xl">{novoCapitulo.titulo ? '✅' : '❌'}</span>
                      <div>
                        <p className="font-medium">Título do Capítulo</p>
                        <p className="text-sm opacity-80">{novoCapitulo.titulo || 'Não preenchido'}</p>
                    </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${novoCapitulo.paginas.length > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      <span className="text-2xl">{novoCapitulo.paginas.length > 0 ? '✅' : '❌'}</span>
                      <div>
                        <p className="font-medium">Páginas</p>
                        <p className="text-sm opacity-80">{novoCapitulo.paginas.length} página(s) selecionada(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleFecharModalNovoCapitulo}
                    className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSalvarNovoCapitulo}
                    disabled={salvandoCapitulo || !novoCapitulo.titulo || novoCapitulo.paginas.length === 0}
                    className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center ${
                      salvandoCapitulo || !novoCapitulo.titulo || novoCapitulo.paginas.length === 0
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105'
                    } text-white`}
                  >
                    {salvandoCapitulo ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📖</span>
                        Adicionar Capítulo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Páginas */}
      {modalAdicionarPaginas && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-600/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">➕ Adicionar Páginas</h2>
                  <p className="text-gray-400">Adicione páginas ao Capítulo {capituloAtual?.numero}</p>
                </div>
                <button 
                  onClick={handleFecharModalAdicionarPaginas}
                  className="text-gray-400 hover:text-white text-3xl transition-colors p-2 hover:bg-gray-700/50 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-8">
                {/* Informações do Capítulo */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-4">📖 Capítulo Selecionado</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-200 text-sm font-medium">Número</p>
                      <p className="text-white text-lg font-bold">{capituloAtual?.numero}</p>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-200 text-sm font-medium">Título</p>
                      <p className="text-white text-lg font-bold truncate">{capituloAtual?.titulo}</p>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-200 text-sm font-medium">Páginas Atuais</p>
                      <p className="text-white text-lg font-bold">{paginasOrdenadas.length}</p>
                    </div>
                  </div>
                  <p className="text-blue-300 text-sm mt-4">
                      💡 As novas páginas serão adicionadas ao final do capítulo
                    </p>
                </div>

                {/* Upload de Páginas */}
                <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">📄 Páginas para Adicionar</h3>
                  
                  {/* Área de upload moderna */}
                  <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center hover:border-blue-500/50 transition-all duration-300 bg-blue-500/5 hover:bg-blue-500/10 mb-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePaginasAdicionarChange}
                      className="hidden"
                      id="adicionar-paginas-upload"
                    />
                    <label htmlFor="adicionar-paginas-upload" className="cursor-pointer block">
                      <div className="space-y-4">
                        <div className="text-6xl text-blue-500">📄</div>
                        <div>
                          <p className="text-white text-lg font-medium">
                          {paginasParaAdicionar.length > 0 
                            ? 'Adicionar mais páginas' 
                            : 'Clique para selecionar as páginas'
                          }
                        </p>
                          <p className="text-gray-400 text-sm mt-2">PNG, JPG, JPEG, WEBP (máx. 10MB cada)</p>
                          <p className="text-gray-500 text-xs mt-1">Você pode selecionar múltiplas imagens</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Gerenciador de Páginas Moderno */}
                  {paginasParaAdicionar.length > 0 && (
                    <EnhancedPageManager
                      paginas={paginasParaAdicionar}
                      onPaginasChange={handlePaginasAdicionarUpdate}
                      onRemove={handleRemovePaginaAdicionar}
                      onUpdateLegenda={handleUpdateLegendaAdicionar}
                      onAddMore={(newPaginas) => {
                        setPaginasParaAdicionar(prev => [...prev, ...newPaginas]);
                      }}
                    />
                  )}
                </div>

                {/* Status dos campos */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h4 className="text-green-300 font-bold mb-4 text-lg">📋 Status</h4>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/20">
                    <span className="text-3xl">{paginasParaAdicionar.length > 0 ? '✅' : '❌'}</span>
                    <div>
                      <p className="text-green-300 font-medium text-lg">
                        {paginasParaAdicionar.length} página(s) selecionada(s)
                      </p>
                      <p className="text-green-200 text-sm">
                        As páginas serão numeradas automaticamente após as existentes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleFecharModalAdicionarPaginas}
                    className="flex-1 bg-gray-600/80 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSalvarPaginasAdicionar}
                    disabled={salvandoPaginas || paginasParaAdicionar.length === 0}
                    className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center ${
                      salvandoPaginas || paginasParaAdicionar.length === 0
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105'
                    } text-white`}
                  >
                    {salvandoPaginas ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">📄</span>
                        Adicionar {paginasParaAdicionar.length} Página(s)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
