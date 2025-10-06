"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';

function ConfirmResetPasswordContent() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: showSuccess, error: showError } = useNotifications();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      showError('Erro', 'Token inválido');
      router.push('/reset-password');
      return;
    }

    // Verificar se o token é válido
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/reset-password/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setTokenValid(true);
        } else {
          showError('Erro', data.error || 'Token inválido ou expirado');
          router.push('/reset-password');
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
        showError('Erro', 'Erro de conexão');
        router.push('/reset-password');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, router, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSenha || !confirmarSenha) {
      showError('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    if (novaSenha.length < 6) {
      showError('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showError('Erro', 'As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          novaSenha 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showSuccess('Sucesso', data.message);
      } else {
        showError('Erro', data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
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
              Validando token...
            </h1>
            <p className="text-gray-300">
              Aguarde enquanto verificamos seu link de reset.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
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
              Token Inválido
            </h1>
            <p className="text-gray-300 mb-6">
              Este link de reset é inválido ou expirou.
            </p>
            <Link
              href="/reset-password"
              className="bg-[var(--color-red)] hover:bg-[#ff0033] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
              style={{boxShadow: '0 0 12px #ff1744'}}
            >
              Solicitar Novo Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
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
              Senha Redefinida! ✅
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Sua senha foi redefinida com sucesso! Agora você pode fazer login com sua nova senha.
            </p>
            
            <div className="bg-[#181818] border border-green-500 rounded-lg p-4 mb-6" style={{boxShadow: '0 0 8px #10b981'}}>
              <p className="text-sm text-green-400">
                🔒 <strong>Segurança:</strong> Se você não fez esta alteração, entre em contato conosco imediatamente.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--color-red)] rounded-full flex items-center justify-center mx-auto mb-4" style={{boxShadow: '0 0 20px #ff1744'}}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-[var(--color-red)] mb-2" style={{textShadow: '0 0 16px #ff1744'}}>
              Nova Senha 🔐
            </h1>
            
            <p className="text-gray-300">
              Digite sua nova senha para concluir o reset.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-300 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                id="novaSenha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-4 py-3 bg-[#181818] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all duration-200"
                placeholder="Digite sua nova senha"
                required
                disabled={isLoading}
                minLength={6}
                style={{boxShadow: '0 0 8px #ff1744'}}
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full px-4 py-3 bg-[#181818] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all duration-200"
                placeholder="Confirme sua nova senha"
                required
                disabled={isLoading}
                minLength={6}
                style={{boxShadow: '0 0 8px #ff1744'}}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--color-red)] hover:bg-[#ff0033] text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              style={{boxShadow: '0 0 12px #ff1744'}}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
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

export default function ConfirmResetPasswordPage() {
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
      <ConfirmResetPasswordContent />
    </Suspense>
  );
}