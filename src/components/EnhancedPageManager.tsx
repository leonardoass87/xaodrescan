"use client";

import React, { useState, useEffect } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface PaginaUpload {
  id: string;
  file: File;
  preview: string;
  numero: number;
  legenda?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
}

interface EnhancedPageManagerProps {
  paginas: PaginaUpload[];
  onPaginasChange: (paginas: PaginaUpload[]) => void;
  onRemove: (id: string) => void;
  onUpdateLegenda: (id: string, legenda: string) => void;
  onAddMore: (newFiles: PaginaUpload[]) => void;
}

export default function EnhancedPageManager({ 
  paginas, 
  onPaginasChange, 
  onRemove, 
  onUpdateLegenda,
  onAddMore
}: EnhancedPageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAddMore, setShowAddMore] = useState(false);

  // Hook para upload de arquivos adicionais
  const {
    files: newFiles,
    isUploading,
    error: uploadError,
    uploadFiles,
    clearFiles
  } = useFileUpload({
    maxFiles: 20,
    maxSizePerFile: 10,
    maxTotalSize: 100,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    timeout: 120000
  });

  // Processar novos arquivos quando uploadFiles é chamado
  const handleAddMoreFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    try {
      await uploadFiles(Array.from(fileList));
    } catch (error: any) {
      console.error('Erro no upload:', error);
    }
  };

  // Quando novos arquivos são processados, adicionar às páginas existentes
  useEffect(() => {
    if (newFiles.length > 0) {
      const newPaginas: PaginaUpload[] = newFiles.map((fileProgress, index) => ({
        id: `pagina_${Date.now()}_${index}`,
        file: fileProgress.file,
        preview: URL.createObjectURL(fileProgress.file),
        numero: paginas.length + index + 1,
        legenda: ''
      }));
      
      onAddMore(newPaginas);
      clearFiles();
      setShowAddMore(false);
    }
  }, [newFiles]); // Removido dependências desnecessárias

  // Ordenar páginas por nome do arquivo (crescente)
  const sortPagesByName = () => {
    const sortedPages = [...paginas].sort((a, b) => 
      a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    // Renumerar após ordenação
    const renumberedPages = sortedPages.map((pagina, index) => ({
      ...pagina,
      numero: index + 1
    }));
    
    onPaginasChange(renumberedPages);
  };

  // Renumerar páginas quando a ordem muda
  const reorderPages = (newOrder: PaginaUpload[]) => {
    const renumberedPages = newOrder.map((pagina, index) => ({
      ...pagina,
      numero: index + 1
    }));
    onPaginasChange(renumberedPages);
  };

  // Mover página para cima
  const moveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...paginas];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      reorderPages(newOrder);
    }
  };

  // Mover página para baixo
  const moveDown = (index: number) => {
    if (index < paginas.length - 1) {
      const newOrder = [...paginas];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      reorderPages(newOrder);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredIndex(index);
  };

  const handleDragLeave = () => {
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newOrder = [...paginas];
      const draggedItem = newOrder[draggedIndex];
      
      // Remove item da posição original
      newOrder.splice(draggedIndex, 1);
      
      // Insere na nova posição
      const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newOrder.splice(newIndex, 0, draggedItem);
      
      reorderPages(newOrder);
    }
    
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  if (paginas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📄</div>
        <p>Nenhuma página carregada</p>
        <p className="text-sm">Selecione as imagens para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            📄 Gerenciar Páginas ({paginas.length})
          </h3>
          <p className="text-sm text-gray-400">
            💡 Arraste para reordenar • Clique nas setas para mover
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={sortPagesByName}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            title="Ordenar por nome do arquivo"
          >
            📝 Ordenar por Nome
          </button>
          
          <button
            type="button"
            onClick={() => setShowAddMore(!showAddMore)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            title="Adicionar mais páginas"
          >
            ➕ Adicionar Páginas
          </button>
        </div>
      </div>

      {/* Seção para adicionar mais páginas */}
      {showAddMore && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-bold mb-2">➕ Adicionar Mais Páginas</h4>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAddMoreFiles}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="text-blue-300 text-sm">
                ⏳ Processando arquivos...
              </div>
            )}
            {uploadError && (
              <div className="text-red-300 text-sm">
                ❌ {uploadError}
              </div>
            )}
            <p className="text-gray-400 text-xs">
              Selecione múltiplas imagens para adicionar ao capítulo
            </p>
          </div>
        </div>
      )}

      {/* Grid de páginas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginas.map((pagina, index) => (
          <div
            key={pagina.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative bg-black/50 border rounded-lg overflow-hidden transition-all duration-200 cursor-move
              ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              ${hoveredIndex === index && draggedIndex !== index ? 'border-blue-500 scale-105' : 'border-red-500/30'}
              hover:border-red-500/50 hover:scale-105
            `}
          >
            {/* Imagem da página */}
            <div className="relative">
              <img 
                src={pagina.preview} 
                alt={`Página ${pagina.numero}`}
                className="w-full h-48 object-cover"
              />
              
              {/* Número da página */}
              <div className="absolute top-2 left-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold">
                #{pagina.numero}
              </div>
              
              {/* Indicador de drag */}
              <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded text-xs">
                ⋮⋮
              </div>
            </div>

            {/* Controles */}
            <div className="p-3 space-y-3">
              {/* Informações da página */}
              <div className="text-center">
                <p className="text-white font-medium text-sm">
                  Página {pagina.numero}
                </p>
                <p className="text-gray-400 text-xs truncate" title={pagina.file.name}>
                  {pagina.file.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {(pagina.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>

              {/* Barra de progresso */}
              {pagina.status && (pagina.status === 'uploading' || pagina.status === 'pending' || pagina.status === 'error') && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300">
                      {pagina.status === 'uploading' ? 'Enviando...' : 
                       pagina.status === 'pending' ? 'Aguardando...' : 
                       pagina.status === 'error' ? 'Erro' : 'Processando...'}
                    </span>
                    <span className="text-gray-300">
                      {pagina.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        pagina.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pagina.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Campo de legenda */}
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Legenda (opcional)
                </label>
                <input
                  type="text"
                  value={pagina.legenda || ''}
                  onChange={(e) => onUpdateLegenda(pagina.id, e.target.value)}
                  placeholder="Ex: Capa do capítulo"
                  className="w-full bg-black/30 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Botões de controle */}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === paginas.length - 1}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 p-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => onRemove(pagina.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-1 rounded text-xs transition-colors"
                  title="Remover página"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Indicador de posição durante drag */}
            {hoveredIndex === index && draggedIndex !== index && (
              <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded-lg pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Instruções */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-300 font-bold mb-2 text-sm">💡 Como usar:</h4>
        <ul className="text-blue-200 text-xs space-y-1">
          <li>• <strong>Arraste</strong> as páginas para reordenar</li>
          <li>• Use as <strong>setas ↑↓</strong> para mover uma posição</li>
          <li>• <strong>Clique em 🗑️</strong> para remover uma página</li>
          <li>• <strong>Ordenar por Nome</strong> para organizar alfabeticamente</li>
          <li>• <strong>Adicionar Páginas</strong> para incluir mais imagens</li>
          <li>• Adicione <strong>legendas</strong> para identificar páginas especiais</li>
        </ul>
      </div>
    </div>
  );
}
