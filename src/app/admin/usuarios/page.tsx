"use client";

import { useState, useEffect } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: "admin" | "usuario";   // 👈 agora reflete o backend (coluna `role`)
  status: "ativo" | "inativo";
  dataCriacao: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");

  // Buscar usuários da API
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await fetch("/api/usuarios"); // rota do backend
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    }

    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
          <p className="text-gray-400 mt-1">Administre todos os usuários da plataforma</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center">
          <span className="mr-2">➕</span>
          Novo Usuário
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none">
              <option value="">Todos os tipos</option>
              <option value="admin">Admin</option>
              <option value="usuario">Usuário</option>
            </select>
            <select className="bg-black/50 border border-red-500/30 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none">
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-500/10 border-b border-red-500/20">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">ID</th>
                <th className="text-left p-4 text-gray-300 font-medium">Nome</th>
                <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                <th className="text-left p-4 text-gray-300 font-medium">Tipo</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Data de Criação</th>
                <th className="text-left p-4 text-gray-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors">
                  <td className="p-4 text-gray-300">#{usuario.id}</td>
                  <td className="p-4 text-white font-medium">{usuario.nome}</td>
                  <td className="p-4 text-gray-300">{usuario.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      usuario.role === 'admin' 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      usuario.status === 'ativo' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded transition-colors">
                        ✏️
                      </button>
                      <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors">
                        🗑️
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-500/10 rounded transition-colors">
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white">{usuarios.length}</div>
          <div className="text-gray-400 text-sm">Total de Usuários</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-green-400">{usuarios.filter(u => u.status === 'ativo').length}</div>
          <div className="text-gray-400 text-sm">Usuários Ativos</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-red-400">{usuarios.filter(u => u.role === 'admin').length}</div>
          <div className="text-gray-400 text-sm">Administradores</div>
        </div>
      </div>
    </div>
  );
}
