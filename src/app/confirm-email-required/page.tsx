"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';

export default function ConfirmEmailRequiredPage() {
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const { success: showSuccess, error: showError, emailSent, emailResent } = useNotifications();

  useEffect(() => {
    // Tentar obter o email do usuário logado
    const getUserEmail = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email || '');
        }
      } catch (error) {
        console.error('Erro ao obter email do usuário:', error);
      }
    };

    getUserEmail();
  }, []);

  const handleResendEmail = async () => {
    if (!userEmail) {
      showError('Erro', 'Email não encontrado. Faça login novamente.');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        emailResent(userEmail);
      } else {
        showError('Erro', data.error || 'Erro ao reenviar email');
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      showError('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)] text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6" style={{boxShadow: '0 0 20px #eab308'}}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-[var(--color-red)] mb-4" style={{textShadow: '0 0 16px #ff1744'}}>
            Confirmação Necessária ⚠️
          </h1>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Para acessar todas as funcionalidades, você precisa confirmar seu email.
          </p>

          {userEmail && (
            <div className="bg-[#181818] border border-yellow-500 rounded-lg p-4 mb-6" style={{boxShadow: '0 0 8px #eab308'}}>
              <p className="text-sm text-yellow-400">
                📧 <strong>Email:</strong> {userEmail}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending || !userEmail}
              className="w-full bg-[var(--color-red)] hover:bg-[#ff0033] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
              style={{boxShadow: '0 0 12px #ff1744'}}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reenviando...
                </>
              ) : (
                '📧 Reenviar Email de Confirmação'
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
            >
              🚪 Fazer Logout
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">
              Não recebeu o email? Verifique sua caixa de spam.
            </p>
            <Link
              href="/login"
              className="text-[var(--color-red)] hover:underline font-medium transition-colors duration-200"
              style={{textShadow: '0 0 8px #ff1744'}}
            >
              ← Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
