"use client";

export default function RelatoriosPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="border-b border-red-500/20 pb-3 md:pb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Relatórios</h1>
        <p className="text-gray-400 text-sm">Análises e estatísticas do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <span className="text-red-400 text-xl">📊</span>
            </div>
            <span className="text-green-400 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Usuários Ativos</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">1,234</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <span className="text-blue-400 text-xl">📚</span>
            </div>
            <span className="text-green-400 text-sm font-medium">+8%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Mangás Publicados</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">567</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <span className="text-green-400 text-xl">👁️</span>
            </div>
            <span className="text-green-400 text-sm font-medium">+23%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">Visualizações</h3>
          <p className="text-2xl md:text-3xl font-bold text-white">45.6K</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Crescimento de Usuários
          </h2>
          <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Gráfico de crescimento (em desenvolvimento)</p>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Mangás Mais Populares
          </h2>
          <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Gráfico de popularidade (em desenvolvimento)</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Atividade Recente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <span className="text-red-400 text-sm">📚</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Novo mangá "One Piece" adicionado</p>
              <p className="text-gray-400 text-xs">há 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <span className="text-blue-400 text-sm">👥</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Novo usuário registrado</p>
              <p className="text-gray-400 text-xs">há 4 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <span className="text-green-400 text-sm">📖</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Capítulo atualizado</p>
              <p className="text-gray-400 text-xs">há 6 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
