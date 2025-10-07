"use client";

import { useState, useRef } from 'react';
import axios from 'axios';

interface FileUploadProgressProps {
  onUploadComplete: (result: any) => void;
  onUploadError: (error: string) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // em MB
  acceptedTypes?: string[];
}

interface FileProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUploadProgress({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSizePerFile = 10, // 10MB por arquivo
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: FileUploadProgressProps) {
  const [files, setFiles] = useState<FileProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: FileList): string | null => {
    // Verificar quantidade de arquivos
    if (fileList.length > maxFiles) {
      return `Você pode enviar no máximo ${maxFiles} arquivos.`;
    }

    // Verificar tamanho total
    const totalSize = Array.from(fileList).reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = maxFiles * maxSizePerFile * 1024 * 1024; // MB para bytes
    
    if (totalSize > maxTotalSize) {
      return `Tamanho total muito grande. Máximo: ${maxFiles * maxSizePerFile}MB`;
    }

    // Verificar cada arquivo
    for (const file of Array.from(fileList)) {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        return `Arquivo "${file.name}" é muito grande. Máximo: ${maxSizePerFile}MB`;
      }
      
      if (!acceptedTypes.includes(file.type)) {
        return `Arquivo "${file.name}" tem tipo não suportado. Tipos aceitos: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const validationError = validateFiles(fileList);
    if (validationError) {
      onUploadError(validationError);
      return;
    }

    const newFiles: FileProgress[] = Array.from(fileList).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setFiles(newFiles);
  };

  const uploadFile = async (fileProgress: FileProgress, index: number): Promise<void> => {
    const formData = new FormData();
    formData.append('file', fileProgress.file);
    formData.append('index', index.toString());

    try {
      setFiles(prev => prev.map((fp, i) => 
        i === index ? { ...fp, status: 'uploading' } : fp
      ));

      const response = await axios.post('/api/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          
          setFiles(prev => prev.map((fp, i) => 
            i === index ? { ...fp, progress } : fp
          ));

          // Atualizar progresso total
          const totalProgress = files.reduce((sum, fp, i) => {
            if (i === index) return sum + progress;
            return sum + fp.progress;
          }, 0) / files.length;

          setTotalProgress(Math.round(totalProgress));
        },
        timeout: 120000 // 2 minutos
      });

      setFiles(prev => prev.map((fp, i) => 
        i === index ? { ...fp, status: 'completed', progress: 100 } : fp
      ));

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro no upload';
      
      setFiles(prev => prev.map((fp, i) => 
        i === index ? { 
          ...fp, 
          status: 'error', 
          error: errorMessage 
        } : fp
      ));

      throw new Error(errorMessage);
    }
  };

  const startUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setTotalProgress(0);

    try {
      // Upload sequencial para evitar sobrecarga
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i], i);
      }

      // Todos os arquivos foram enviados com sucesso
      const uploadedFiles = files.map(fp => ({
        name: fp.file.name,
        size: fp.file.size,
        type: fp.file.type,
        url: `/uploads/${fp.file.name}` // URL temporária
      }));

      onUploadComplete({
        files: uploadedFiles,
        totalFiles: files.length,
        totalSize: files.reduce((sum, fp) => sum + fp.file.size, 0)
      });

    } catch (error: any) {
      onUploadError(error.message || 'Falha no upload. Tente novamente com menos arquivos ou tamanho reduzido.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setTotalProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Upload de Arquivos</h3>
        <p className="text-gray-300 text-sm">
          Máximo: {maxFiles} arquivos, {maxSizePerFile}MB por arquivo
        </p>
      </div>

      {/* Seleção de arquivos */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
        </button>
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">
              {files.length} arquivo(s) selecionado(s)
            </span>
            <button
              onClick={clearFiles}
              disabled={isUploading}
              className="text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Limpar
            </button>
          </div>

          <div className="space-y-3">
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
                    {!isUploading && (
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

          {/* Progresso total */}
          {isUploading && (
            <div className="mt-4">
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
      )}

      {/* Botões de ação */}
      {files.length > 0 && (
        <div className="flex space-x-4">
          <button
            onClick={startUpload}
            disabled={isUploading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isUploading ? 'Enviando...' : 'Iniciar Upload'}
          </button>
          
          <button
            onClick={clearFiles}
            disabled={isUploading}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
