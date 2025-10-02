"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !senha || !confirmarSenha) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔑 Salvar token do usuário
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        setSuccess("Registro realizado com sucesso! Redirecionando...");
        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");

        // ⏳ Redireciona após 2 segundos
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.error || "Erro ao registrar usuário");
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] bg-[var(--color-bg)] bg-gradient-to-br from-[#181818] to-[#232323]">
      <div className="w-full max-w-md bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)]">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/image/logo.png"
            alt="Logo XaodreScan"
            className="h-12 w-12 mb-2 drop-shadow-[0_0_12px_#ff1744]"
          />
          <h1
            className="text-[var(--color-red)] text-3xl font-bold mb-2"
            style={{ textShadow: "0 0 16px #ff1744, 0 0 32px #ff1744" }}
          >
            Registrar
          </h1>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="bg-[#181818] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-[var(--color-red)] shadow-[0_0_8px_#ff1744]"
          />
          <button
            type="submit"
            className="bg-[var(--color-red)] hover:bg-[#ff0033] text-white font-bold py-2 rounded shadow-lg transition-colors"
            style={{ boxShadow: "0 0 12px #ff1744, 0 0 24px #ff1744" }}
          >
            Registrar
          </button>
        </form>
        {error && (
          <div className="text-[var(--color-red)] mt-4 text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-400 mt-4 text-center">{success}</div>
        )}
        <div className="flex flex-col items-center mt-6 gap-2">
          <a
            href="/login"
            className="text-white hover:text-[var(--color-red)] hover:underline text-sm transition-colors"
          >
            Já tem conta? Entrar
          </a>
        </div>
      </div>
    </main>
  );
}
