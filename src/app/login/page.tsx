"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email || !senha) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Login efetuado com sucesso!");
        
        // Usar o contexto para fazer login
        login(data.user);
        
        // Aguardar um pouco para garantir que o login foi processado
        setTimeout(() => {
          // Redirecionar baseado no role do usuário
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 100);
      } else {
        if (data.requiresEmailConfirmation) {
          setError("Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login.");
        } else {
          setError(data.error || "Erro ao fazer login");
        }
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] bg-[var(--color-bg)] bg-gradient-to-br from-[#181818] to-[#232323]">
      <div className="w-full max-w-md bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)]">
        <div className="flex flex-col items-center mb-8">
          <Logo 
            size={48} 
            className="mb-2 drop-shadow-[0_0_12px_#ff1744]"
          />
          <h1 className="text-[var(--color-red)] text-3xl font-bold mb-2" style={{textShadow: '0 0 16px #ff1744, 0 0 32px #ff1744'}}>Entrar</h1>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <button type="submit" className="bg-[var(--color-red)] hover:bg-[#ff0033] text-white font-bold py-2 rounded shadow-lg transition-colors" style={{boxShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>Login</button>
        </form>
        {error && <div className="text-[var(--color-red)] mt-4 text-center">{error}</div>}
        {success && <div className="text-green-400 mt-4 text-center">{success}</div>}
        <div className="flex flex-col items-center mt-6 gap-2">
          <Link href="/reset-password" className="text-[var(--color-red)] hover:underline text-sm" style={{textShadow: '0 0 8px #ff1744'}}>Esqueci a senha</Link>
          <Link href="/register" className="text-white hover:text-[var(--color-red)] hover:underline text-sm transition-colors">Registrar</Link>
        </div>
      </div>
    </main>
  );
}
