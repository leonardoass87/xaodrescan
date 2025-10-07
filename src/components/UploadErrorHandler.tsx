"use client";

import { useState, useEffect } from 'react';

interface UploadErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function UploadErrorHandler({ error, onRetry, onDismiss }: UploadErrorHandlerProps) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('ECONNRESET') || errorMessage.includes('timeout')) {
      return {
        type: 'timeout',
        title: 'Timeout de Conexão',
        message: 'O envio demorou muito para ser processado. Tente novamente com menos arquivos ou tamanho reduzido.',
        suggestion: 'Recomendamos enviar no máximo 5 arquivos por vez ou reduzir o tamanho das imagens.'
      };
    }
    
    if (errorMessage.includes('413') || errorMessage.includes('too large')) {
      return {
        type: 'size',
        title: 'Arquivo Muito Grande',
        message: 'O tamanho total dos arquivos excede o limite permitido.',
        suggestion: 'Reduza o tamanho das imagens ou envie menos arquivos por vez.'
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        type: 'network',
        title: 'Erro de Conexão',
        message: 'Problema de conectividade detectado.',
        suggestion: 'Verifique sua conexão com a internet e tente novamente.'
      };
    }
    
    return {
      type: 'generic',
      title: 'Erro no Upload',
      message: errorMessage,
      suggestion: 'Tente novamente ou entre em contato com o suporte se o problema persistir.'
    };
  };

  const handleRetry = () => {
    setShowError(false);
    onRetry?.();
  };

  const handleDismiss = () => {
    setShowError(false);
    onDismiss?.();
  };

  if (!showError || !error) return null;

  const errorInfo = getErrorType(error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-red-500">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-white">
              {errorInfo.title}
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-300 text-sm">
            {errorInfo.message}
          </p>
        </div>
        
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded p-3 mb-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Dica:</strong> {errorInfo.suggestion}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {onRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
