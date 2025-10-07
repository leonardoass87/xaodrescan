"use client";

import { useState, useCallback } from 'react';
import axios, { AxiosProgressEvent } from 'axios';

interface FileUploadOptions {
  maxFiles?: number;
  maxSizePerFile?: number; // em MB
  maxTotalSize?: number; // em MB
  acceptedTypes?: string[];
  timeout?: number; // em ms
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UseFileUploadReturn {
  files: UploadProgress[];
  isUploading: boolean;
  totalProgress: number;
  error: string | null;
  uploadFiles: (files: File[]) => Promise<any>;
  clearFiles: () => void;
  removeFile: (index: number) => void;
  retryUpload: () => Promise<void>;
}

export function useFileUpload(options: FileUploadOptions = {}): UseFileUploadReturn {
  const {
    maxFiles = 10,
    maxSizePerFile = 10,
    maxTotalSize = 100,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    timeout = 120000 // 2 minutos
  } = options;

  const [files, setFiles] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback((fileList: File[]): string | null => {
    // Verificar quantidade
    if (fileList.length > maxFiles) {
      return `Máximo de ${maxFiles} arquivos permitidos.`;
    }

    // Verificar tamanho total
    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSizeBytes = maxTotalSize * 1024 * 1024;
    
    if (totalSize > maxTotalSizeBytes) {
      return `Tamanho total muito grande. Máximo: ${maxTotalSize}MB`;
    }

    // Verificar cada arquivo
    for (const file of fileList) {
      if (file.size > maxSizePerFile * 1024 * 1024) {
        return `Arquivo "${file.name}" é muito grande. Máximo: ${maxSizePerFile}MB`;
      }
      
      if (!acceptedTypes.includes(file.type)) {
        return `Arquivo "${file.name}" tem tipo não suportado.`;
      }
    }

    return null;
  }, [maxFiles, maxSizePerFile, maxTotalSize, acceptedTypes]);

  const uploadFile = useCallback(async (fileProgress: UploadProgress, index: number): Promise<any> => {
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
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          
          setFiles(prev => prev.map((fp, i) => 
            i === index ? { ...fp, progress } : fp
          ));

          // Atualizar progresso total
          const newTotalProgress = files.reduce((sum, fp, i) => {
            if (i === index) return sum + progress;
            return sum + fp.progress;
          }, 0) / files.length;

          setTotalProgress(Math.round(newTotalProgress));
        },
        timeout
      });

      setFiles(prev => prev.map((fp, i) => 
        i === index ? { ...fp, status: 'completed', progress: 100 } : fp
      ));

      return response.data;

    } catch (error: any) {
      let errorMessage = 'Erro desconhecido';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: O upload demorou muito para ser processado.';
      } else if (error.code === 'ECONNRESET') {
        errorMessage = 'Conexão perdida durante o upload.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Arquivo muito grande para o servidor.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFiles(prev => prev.map((fp, i) => 
        i === index ? { 
          ...fp, 
          status: 'error', 
          error: errorMessage 
        } : fp
      ));

      throw new Error(errorMessage);
    }
  }, [files, timeout]);

  const uploadFiles = useCallback(async (fileList: File[]): Promise<any> => {
    setError(null);
    
    const validationError = validateFiles(fileList);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    const newFiles: UploadProgress[] = fileList.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setFiles(newFiles);
    setIsUploading(true);
    setTotalProgress(0);

    try {
      // Upload sequencial para evitar sobrecarga
      const results = [];
      for (let i = 0; i < newFiles.length; i++) {
        const result = await uploadFile(newFiles[i], i);
        results.push(result);
      }

      return {
        files: results,
        totalFiles: newFiles.length,
        totalSize: newFiles.reduce((sum, fp) => sum + fp.file.size, 0)
      };

    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [validateFiles, uploadFile]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setTotalProgress(0);
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const retryUpload = useCallback(async () => {
    const pendingFiles = files.filter(fp => fp.status === 'error' || fp.status === 'pending');
    if (pendingFiles.length === 0) return;

    const fileList = pendingFiles.map(fp => fp.file);
    await uploadFiles(fileList);
  }, [files, uploadFiles]);

  return {
    files,
    isUploading,
    totalProgress,
    error,
    uploadFiles,
    clearFiles,
    removeFile,
    retryUpload
  };
}
