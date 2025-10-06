"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';

function ConfirmEmailContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: showSuccess, error: showError, emailConfirmed, emailExpired } = useNotifications();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de confirmação não encontrado');
      setIsLoading(false);
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(`/api/confirm-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setIsConfirmed(true);
          emailConfirmed();
        } else {
          if (data.error?.includes('expirado')) {
            emailExpired();
          } else {
            showError('Erro', data.error || 'Erro ao confirmar email');
          }
          setError(data.error || 'Erro ao confirmar email');
        }
      } catch (error) {
        console.error('Erro ao confirmar email:', error);
        setError('Erro de conexão');
        showError('Erro', 'Erro de conexão');
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [token, showSuccess, showError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)] text-center">
            <div className="w-16 h-16 bg-[var(--color-red)] rounded-full flex items-center justify-center mx-auto mb-6" style={{boxShadow: '0 0 20px #ff1744'}}>
              <svg className="animate-spin w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-red)] mb-2" style={{textShadow: '0 0 16px #ff1744'}}>
              Confirmando email...
            </h1>
            <p className="text-gray-300">
              Aguarde enquanto confirmamos seu email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)] text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6" style={{boxShadow: '0 0 20px #ef4444'}}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-red)] mb-2" style={{textShadow: '0 0 16px #ff1744'}}>
              Erro na Confirmação
            </h1>
            <p className="text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full bg-[var(--color-red)] hover:bg-[#ff0033] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 inline-block"
                style={{boxShadow: '0 0 12px #ff1744'}}
              >
                Ir para Login
              </Link>
              <Link
                href="/register"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 inline-block"
              >
                Criar Nova Conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)] text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6" style={{boxShadow: '0 0 20px #10b981'}}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-red)] mb-4" style={{textShadow: '0 0 16px #ff1744'}}>
              Email Confirmado! ✅
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Seu email foi confirmado com sucesso! Agora você pode fazer login e acessar todas as funcionalidades.
            </p>
            
            <div className="bg-[#181818] border border-green-500 rounded-lg p-4 mb-6" style={{boxShadow: '0 0 8px #10b981'}}>
              <p className="text-sm text-green-400">
                🔒 <strong>Segurança:</strong> Sua conta está agora totalmente ativada e segura.
              </p>
            </div>
            
            <Link
              href="/login"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 inline-block"
              style={{boxShadow: '0 0 12px #10b981'}}
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export const dynamic = 'force-dynamic';

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)] text-center">
            <div className="w-16 h-16 bg-[var(--color-red)] rounded-full flex items-center justify-center mx-auto mb-6" style={{boxShadow: '0 0 20px #ff1744'}}>
              <svg className="animate-spin w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-red)] mb-2" style={{textShadow: '0 0 16px #ff1744'}}>
              Carregando...
            </h1>
            <p className="text-gray-300">
              Aguarde enquanto carregamos a página.
            </p>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
