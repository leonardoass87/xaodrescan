"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { success: showSuccess, error: showError } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showError('Erro', 'Por favor, digite seu email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        showSuccess('Sucesso', data.message);
      } else {
        showError('Erro', data.error || 'Erro ao solicitar reset de senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro', 'Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
              Email Enviado! 📧
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Se o email <strong className="text-[var(--color-red)]">{email}</strong> existir em nosso sistema, você receberá um link para redefinir sua senha.
            </p>
            
            <div className="bg-[#181818] border border-[var(--color-red)] rounded-lg p-4 mb-6" style={{boxShadow: '0 0 8px #ff1744'}}>
              <p className="text-sm text-[var(--color-red)]">
                💡 <strong>Dica:</strong> Verifique sua caixa de spam se não receber o email em alguns minutos.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-[var(--color-red)] hover:bg-[#ff0033] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
                style={{boxShadow: '0 0 12px #ff1744'}}
              >
                Enviar Novamente
              </button>
              
              <Link
                href="/login"
                className="block w-full bg-gray-800 text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
              >
                Voltar ao Login
              </Link>
            </div>
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
              Esqueceu sua senha? 🔐
            </h1>
            
            <p className="text-gray-300">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#181818] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-red)] focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
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
                  Enviando...
                </>
              ) : (
                'Enviar Link de Reset'
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