"use client";

import { useState, useEffect } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: "ADMIN" | "USUARIO" | "admin" | "usuario";   // Aceita ambos os formatos
  status?: "ativo" | "inativo";
  dataCriacao: string;
  email_confirmado?: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState("");

  // Buscar usuários da API
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        // Dados mockados temporariamente até a API funcionar
        const data = [
          {
            id: 1,
            nome: "leonardo",
            email: "leoalvesjf@gmail.com",
            role: "ADMIN",
            created_at: "2025-10-08T19:08:08.857Z",
            dataCriacao: "2025-10-08T19:08:08.857Z",
            email_confirmado: true
          }
        ];
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gerenciar Usuários</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Administre todos os usuários da plataforma</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm md:text-base">
          <span className="mr-2">➕</span>
          <span className="hidden sm:inline">Novo Usuário</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full bg-black/50 border border-red-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-black/50 border border-red-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white focus:border-red-500 focus:outline-none text-sm md:text-base flex-1 md:flex-none">
              <option value="">Todos os tipos</option>
              <option value="admin">Admin</option>
              <option value="usuario">Usuário</option>
            </select>
            <select className="bg-black/50 border border-red-500/30 rounded-lg px-3 md:px-4 py-2 md:py-3 text-white focus:border-red-500 focus:outline-none text-sm md:text-base flex-1 md:flex-none">
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuários - Mobile Cards / Desktop Table */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl overflow-hidden">
        {/* Mobile Cards */}
        <div className="md:hidden">
          {usuariosFiltrados.map((usuario) => (
            <div key={usuario.id} className="border-b border-red-500/10 p-4 hover:bg-red-500/5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">{usuario.nome}</h3>
                    <p className="text-gray-400 text-xs">#{usuario.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-500/10 rounded transition-colors" title="Editar">
                    ✏️
                  </button>
                  <button className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition-colors" title="Deletar">
                    🗑️
                  </button>
                  <button className="text-gray-400 hover:text-gray-300 p-1.5 hover:bg-gray-500/10 rounded transition-colors" title="Ver">
                    👁️
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Email:</span>
                  <span className="text-white text-xs truncate ml-2">{usuario.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Tipo:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (usuario.role === 'ADMIN' || usuario.role === 'admin')
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {(usuario.role === 'ADMIN' || usuario.role === 'admin') ? 'Admin' : 'Usuário'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (usuario.status === 'ativo' || usuario.email_confirmado !== false)
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {(usuario.status === 'ativo' || usuario.email_confirmado !== false) ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-500/10 border-b border-red-500/20">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">ID</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Nome</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Email</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Tipo</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Data de Criação</th>
                <th className="text-left p-4 text-gray-300 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors">
                  <td className="p-4 text-gray-300 text-sm">#{usuario.id}</td>
                  <td className="p-4 text-white font-medium text-base truncate">{usuario.nome}</td>
                  <td className="p-4 text-gray-300 text-sm truncate">{usuario.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (usuario.role === 'ADMIN' || usuario.role === 'admin')
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {(usuario.role === 'ADMIN' || usuario.role === 'admin') ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (usuario.status === 'ativo' || usuario.email_confirmado !== false)
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {(usuario.status === 'ativo' || usuario.email_confirmado !== false) ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">{new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded transition-colors" title="Editar usuário">
                        ✏️
                      </button>
                      <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors" title="Deletar usuário">
                        🗑️
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-500/10 rounded transition-colors" title="Visualizar usuário">
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
          <div className="text-2xl font-bold text-green-400">
            {usuarios.filter(u => {
              // Se tem status definido, usa ele; senão, assume ativo se email confirmado
              if (u.status) {
                return u.status === 'ativo';
              }
              return u.email_confirmado !== false; // Assume ativo se não especificado
            }).length}
          </div>
          <div className="text-gray-400 text-sm">Usuários Ativos</div>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-red-400">
            {usuarios.filter(u => u.role === 'ADMIN' || u.role === 'admin').length}
          </div>
          <div className="text-gray-400 text-sm">Administradores</div>
        </div>
      </div>
    </div>
  );
}
