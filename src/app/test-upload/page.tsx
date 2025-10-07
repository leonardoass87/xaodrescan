"use client";

import { useState } from 'react';
import ImprovedMangaUpload from '@/components/ImprovedMangaUpload';
import FileUploadProgress from '@/components/FileUploadProgress';

export default function TestUploadPage() {
  const [testMode, setTestMode] = useState<'complete' | 'simple'>('complete');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (data: any) => {
    setResult(data);
    setError(null);
    console.log('✅ Upload bem-sucedido:', data);
  };

  const handleError = (err: string) => {
    setError(err);
    setResult(null);
    console.error('❌ Erro no upload:', err);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🧪 Teste do Sistema de Upload
          </h1>
          <p className="text-gray-300 mb-6">
            Teste os novos componentes de upload implementados
          </p>
          
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setTestMode('complete')}
              className={`px-4 py-2 rounded ${
                testMode === 'complete' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Formulário Completo
            </button>
            <button
              onClick={() => setTestMode('simple')}
              className={`px-4 py-2 rounded ${
                testMode === 'simple' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Upload Simples
            </button>
          </div>
        </div>

        {/* Resultados */}
        {(result || error) && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Resultado do Teste</h3>
            {result && (
              <div className="text-green-400">
                <p>✅ <strong>Sucesso!</strong></p>
                <pre className="mt-2 text-sm bg-gray-900 p-4 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            {error && (
              <div className="text-red-400">
                <p>❌ <strong>Erro:</strong></p>
                <p className="mt-2 bg-gray-900 p-4 rounded">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Componentes de Teste */}
        {testMode === 'complete' ? (
          <ImprovedMangaUpload
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Upload Simples de Arquivos
              </h3>
              <FileUploadProgress
                onUploadComplete={handleSuccess}
                onUploadError={handleError}
                maxFiles={5}
                maxSizePerFile={5}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>
            
            {/* Upload de Capa Simples */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">
                Teste de Upload de Capa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Selecionar Capa
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('📷 Capa selecionada:', file.name, file.size, 'bytes');
                        handleSuccess({ 
                          message: 'Capa selecionada com sucesso!', 
                          fileName: file.name,
                          fileSize: file.size 
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  Este é um teste simples para verificar se o upload de capa está funcionando.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações de Debug */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">
            🔍 Informações de Debug
          </h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Configurações aplicadas:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>✅ Runtime: Node.js (sem timeout de 30s)</li>
              <li>✅ Max Duration: 120 segundos</li>
              <li>✅ Validações de segurança implementadas</li>
              <li>✅ Logs de debug ativados</li>
              <li>✅ Tratamento de erros melhorado</li>
              <li>✅ Upload via FormData (mais eficiente)</li>
              <li>✅ Progresso individual por arquivo</li>
            </ul>
            
            <p className="mt-4"><strong>Para testar em produção:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>1. Verifique os logs do servidor para ver os dados recebidos</li>
              <li>2. Teste com arquivos grandes (até 10MB por arquivo)</li>
              <li>3. Teste com múltiplos arquivos (até 20 arquivos)</li>
              <li>4. Verifique se não há mais erros ECONNRESET</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
