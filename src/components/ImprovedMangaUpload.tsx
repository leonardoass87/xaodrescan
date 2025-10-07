"use client";

import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import UploadErrorHandler from './UploadErrorHandler';

interface ImprovedMangaUploadProps {
  onSuccess: (result: any) => void;
}

export default function ImprovedMangaUpload({ onSuccess }: ImprovedMangaUploadProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    generos: '',
    status: 'EM_ANDAMENTO',
    capituloNumero: 1,
    capituloTitulo: ''
  });
  
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
    maxFiles: 20,
    maxSizePerFile: 10,
    maxTotalSize: 100,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    timeout: 120000
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    try {
      await uploadFiles(Array.from(fileList));
    } catch (error: any) {
      console.error('Erro no upload:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setSubmitError('Selecione pelo menos um arquivo para upload');
      return;
    }

    if (files.some(f => f.status === 'error')) {
      setSubmitError('Corrija os erros de upload antes de continuar');
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
      formDataToSend.append('status', formData.status);
      formDataToSend.append('capitulo.numero', formData.capituloNumero.toString());
      formDataToSend.append('capitulo.titulo', formData.capituloTitulo);

      // Adicionar arquivos
      files.forEach((fileProgress) => {
        formDataToSend.append('capitulo.paginas', fileProgress.file);
      });

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
        status: 'EM_ANDAMENTO',
        capituloNumero: 1,
        capituloTitulo: ''
      });
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
          
          {/* Seleção de arquivos */}
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
              {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
            </label>
            <span className="ml-2 text-gray-400 text-sm">
              Máximo: 20 arquivos, 10MB por arquivo
            </span>
          </div>

          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="space-y-3 mb-4">
              {files.map((fileProgress, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm truncate max-w-xs">
                      {fileProgress.file.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {(fileProgress.file.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                      {!isUploading && !isSubmitting && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso individual */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        fileProgress.status === 'completed' ? 'bg-green-500' :
                        fileProgress.status === 'error' ? 'bg-red-500' :
                        fileProgress.status === 'uploading' ? 'bg-blue-500' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${fileProgress.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className={`${
                      fileProgress.status === 'completed' ? 'text-green-400' :
                      fileProgress.status === 'error' ? 'text-red-400' :
                      fileProgress.status === 'uploading' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {fileProgress.status === 'completed' ? 'Concluído' :
                       fileProgress.status === 'error' ? `Erro: ${fileProgress.error}` :
                       fileProgress.status === 'uploading' ? 'Enviando...' :
                       'Aguardando'}
                    </span>
                    <span className="text-gray-400">
                      {fileProgress.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
            disabled={isUploading || isSubmitting || files.length === 0 || files.some(f => f.status === 'error')}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Mangá'}
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
