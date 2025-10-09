"use client";

import { useState } from 'react';
import FileUploadProgress from './FileUploadProgress';

interface MangaUploadFormProps {
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export default function MangaUploadForm({ onSuccess, onError }: MangaUploadFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    generos: '',
    status: 'EM_ANDAMENTO',
    capituloNumero: 1,
    capituloTitulo: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUploadComplete = (result: any) => {
    setUploadedFiles(result.files);
  };

  const handleFileUploadError = (error: string) => {
    onError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      onError('Selecione pelo menos um arquivo para upload');
      return;
    }

    setIsSubmitting(true);

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
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append('capitulo.paginas', file.file);
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

    } catch (error: any) {
      onError(error.message || 'Erro ao criar mangá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Mangá</h2>
      
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
          <FileUploadProgress
            onUploadComplete={handleFileUploadComplete}
            onUploadError={handleFileUploadError}
            maxFiles={100} // Aumentado para permitir mais páginas
            maxSizePerFile={10}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
          />
        </div>

        {/* Botão de Envio */}
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
              setUploadedFiles([]);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Limpar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || uploadedFiles.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando...' : 'Criar Mangá'}
          </button>
        </div>
      </form>
    </div>
  );
}
