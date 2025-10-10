"use client";

import { useState, useEffect } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import UploadErrorHandler from './UploadErrorHandler';
import EnhancedPageManager from './EnhancedPageManager';

interface ImprovedMangaUploadProps {
  onSuccess: (result: any) => void;
}

export default function ImprovedMangaUpload({ onSuccess }: ImprovedMangaUploadProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    generos: '',
    description: '',
    status: 'EM_ANDAMENTO',
    capituloNumero: 1,
    capituloTitulo: ''
  });
  
  const [capa, setCapa] = useState<File | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  const [paginas, setPaginas] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    files,
    isUploading,
    totalProgress,
    error: uploadError,
    uploadFiles,
    clearFiles,
    removeFile,
    retryUpload
  } = useFileUpload({
    maxFiles: 100, // Aumentado para permitir mais páginas
    maxSizePerFile: 10,
    maxTotalSize: 500, // Aumentado proporcionalmente
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    timeout: 120000
  });

  const handleCapaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCapa(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewCapa(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    try {
      console.log('📤 Processando', fileList.length, 'arquivos localmente');
      console.log('📊 Estado atual de paginas:', paginas.length);
      
      // Processar arquivos diretamente sem upload
      const newPaginas = await Promise.all(
        Array.from(fileList).map(async (file, index) => {
          // Converter para base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          return {
            id: `pagina_${Date.now()}_${index}`,
            file,
            preview: base64, // Agora é base64 com data:image/... prefix
            numero: paginas.length + index + 1,
            legenda: '',
            progress: 100,
            status: 'completed' as const
          };
        })
      );
      
      console.log('📄 Novas páginas criadas:', newPaginas.length);
      setPaginas(prev => {
        const updated = [...prev, ...newPaginas];
        console.log('📊 Estado atualizado:', updated.length, 'páginas');
        return updated;
      });
    } catch (error: any) {
      console.error('Erro no processamento:', error);
    }
  };

  // Funções para gerenciar páginas
  const handlePaginasChange = (novasPaginas: any[]) => {
    setPaginas(novasPaginas);
  };

  const handleRemovePagina = (id: string) => {
    setPaginas(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateLegenda = (id: string, legenda: string) => {
    setPaginas(prev => prev.map(p => 
      p.id === id ? { ...p, legenda } : p
    ));
  };

  const handleAddMorePages = (newPages: any[]) => {
    setPaginas(prev => [...prev, ...newPages]);
  };

  // Debug do estado de páginas
  useEffect(() => {
    console.log('🔍 Estado de páginas atualizado:', paginas.length, 'páginas');
  }, [paginas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo) {
      setSubmitError('Título é obrigatório');
      return;
    }
    
    if (!capa) {
      setSubmitError('Capa é obrigatória');
      return;
    }
    
    if (paginas.length === 0) {
      setSubmitError('Adicione pelo menos uma página ao capítulo');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Criar FormData para envio
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('autor', formData.autor);
      formDataToSend.append('generos', formData.generos);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      
      // Adicionar capa (obrigatória)
      if (capa) {
        formDataToSend.append('capa', capa);
        console.log('📷 Capa adicionada ao FormData:', capa.name, capa.size, 'bytes');
      } else {
        throw new Error('Capa é obrigatória');
      }
      
      formDataToSend.append('capitulo.numero', formData.capituloNumero.toString());
      formDataToSend.append('capitulo.titulo', formData.capituloTitulo);

      // Adicionar arquivos das páginas (na ordem correta)
      paginas.forEach((pagina, index) => {
        formDataToSend.append('capitulo.paginas', pagina.file);
        console.log(`📄 Página ${index + 1} adicionada:`, pagina.file.name, pagina.file.size, 'bytes');
      });
      
      console.log('📦 FormData preparado com', paginas.length, 'páginas');

      // Enviar para API
      const response = await fetch('/api/mangas', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar mangá');
      }

      const result = await response.json();
      onSuccess(result);

      // Limpar formulário
      setFormData({
        titulo: '',
        autor: '',
        generos: '',
        description: '',
        status: 'EM_ANDAMENTO',
        capituloNumero: 1,
        capituloTitulo: ''
      });
      setCapa(null);
      setPreviewCapa(null);
      setPaginas([]);
      clearFiles();

    } catch (error: any) {
      setSubmitError(error.message || 'Erro ao criar mangá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    retryUpload();
  };

  const handleDismissError = () => {
    setSubmitError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Mangá (Sistema Melhorado)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Capa */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Capa do Mangá *
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors bg-gray-800/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleCapaChange}
              className="hidden"
              id="capa-upload"
            />
            <label htmlFor="capa-upload" className="cursor-pointer">
              {previewCapa ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={previewCapa} 
                      alt="Preview da capa" 
                      className="mx-auto max-h-48 rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCapa(null);
                        setPreviewCapa(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                      title="Remover capa"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-green-400">✓ Capa selecionada: {capa?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📷</div>
                  <p className="text-white">Clique para selecionar a capa</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, JPEG (máx. 10MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Informações do Mangá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Autor
            </label>
            <input
              type="text"
              value={formData.autor}
              onChange={(e) => setFormData({...formData, autor: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descreva a história do mangá..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white resize-none"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Gêneros
            </label>
            <input
              type="text"
              value={formData.generos}
              onChange={(e) => setFormData({...formData, generos: e.target.value})}
              placeholder="Ex: Ação, Aventura, Romance"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="COMPLETO">Completo</option>
              <option value="PAUSADO">Pausado</option>
            </select>
          </div>
        </div>

        {/* Informações do Capítulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Número do Capítulo *
            </label>
            <input
              type="number"
              value={formData.capituloNumero}
              onChange={(e) => setFormData({...formData, capituloNumero: parseInt(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              required
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Título do Capítulo
            </label>
            <input
              type="text"
              value={formData.capituloTitulo}
              onChange={(e) => setFormData({...formData, capituloTitulo: e.target.value})}
              placeholder="Ex: O Início da Jornada"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>
        </div>

        {/* Upload de Arquivos */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Páginas do Capítulo</h3>
          
          {/* Seleção inicial de arquivos */}
          {paginas.length === 0 && (
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isUploading || isSubmitting}
              />
              <label
                htmlFor="file-input"
                className={`inline-block px-4 py-2 rounded cursor-pointer transition-colors ${
                  isUploading || isSubmitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Enviando...' : 'Selecionar Arquivos Iniciais'}
              </label>
              <span className="ml-2 text-gray-400 text-sm">
                Máximo: 10MB por arquivo
              </span>
            </div>
          )}

          {/* Gerenciador de páginas melhorado */}
          {paginas.length > 0 && (
            <EnhancedPageManager
              paginas={paginas}
              onPaginasChange={handlePaginasChange}
              onRemove={handleRemovePagina}
              onUpdateLegenda={handleUpdateLegenda}
              onAddMore={handleAddMorePages}
            />
          )}

          {/* Progresso total */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Progresso Total</span>
                <span className="text-white">{totalProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                titulo: '',
                autor: '',
                generos: '',
                description: '',
                status: 'EM_ANDAMENTO',
                capituloNumero: 1,
                capituloTitulo: ''
              });
              clearFiles();
              setSubmitError(null);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            disabled={isUploading || isSubmitting}
          >
            Limpar
          </button>
          
          <button
            type="submit"
            disabled={isUploading || isSubmitting || paginas.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : `Criar Mangá (${paginas.length} páginas)`}
          </button>
        </div>
      </form>

      {/* Tratamento de erros */}
      <UploadErrorHandler
        error={uploadError || submitError}
        onRetry={handleRetry}
        onDismiss={handleDismissError}
      />
    </div>
  );
}
