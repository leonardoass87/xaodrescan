"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
    // Simulação de login (substitua pela chamada real à API)
    if (email === "admin@teste.com" && senha === "123456") {
      setSuccess("Login efetuado com sucesso!");
      setEmail("");
      setSenha("");
    } else {
      setError("E-mail ou senha incorretos.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] bg-[var(--color-bg)] bg-gradient-to-br from-[#181818] to-[#232323]">
      <div className="w-full max-w-md bg-black/70 rounded-xl shadow-2xl p-8 border border-[var(--color-red)]">
        <div className="flex flex-col items-center mb-8">
          <img src="/image/logo.png" alt="Logo XaodreScan" className="h-12 w-12 mb-2 drop-shadow-[0_0_12px_#ff1744]" />
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
          <a href="#" className="text-[var(--color-red)] hover:underline text-sm" style={{textShadow: '0 0 8px #ff1744'}}>Esqueci a senha</a>
          <Link href="/register" className="text-white hover:text-[var(--color-red)] hover:underline text-sm transition-colors">Registrar</Link>
        </div>
      </div>
    </main>
  );
}
