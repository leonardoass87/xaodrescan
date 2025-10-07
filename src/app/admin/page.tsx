export default function AdminDashboard() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="border-b border-red-500/20 pb-3 md:pb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Painel de controle do XaodreScan</p>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-3 md:p-4 hover:border-red-500/40 transition-all duration-300 hover:scale-105">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-red-500/20 p-2 rounded-xl">
                <span className="text-red-400 text-lg">👥</span>
              </div>
              <span className="text-green-400 text-xs font-medium">+12%</span>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">Usuários</p>
            <p className="text-lg md:text-xl font-bold text-white">1,234</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-3 md:p-4 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <span className="text-blue-400 text-lg">📚</span>
              </div>
              <span className="text-green-400 text-xs font-medium">+8%</span>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">Mangás</p>
            <p className="text-lg md:text-xl font-bold text-white">567</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-3 md:p-4 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-500/20 p-2 rounded-xl">
                <span className="text-green-400 text-lg">📖</span>
              </div>
              <span className="text-green-400 text-xs font-medium">+15%</span>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">Capítulos</p>
            <p className="text-lg md:text-xl font-bold text-white">2,891</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-3 md:p-4 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                <span className="text-purple-400 text-lg">👁️</span>
              </div>
              <span className="text-green-400 text-xs font-medium">+23%</span>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">Visualizações</p>
            <p className="text-lg md:text-xl font-bold text-white">45.6K</p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Ações Rápidas
          </h2>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center">
              <span className="mr-2">📚</span>
              Novo Mangá
            </button>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center">
              <span className="mr-2">👥</span>
              Novo Usuário
            </button>
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center">
              <span className="mr-2">📊</span>
              Relatórios
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Atividade Recente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <span className="text-red-400 text-sm">📚</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Novo mangá adicionado</p>
                <p className="text-gray-400 text-xs">há 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <span className="text-blue-400 text-sm">👥</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Usuário "João Silva" se registrou</p>
                <p className="text-gray-400 text-xs">há 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <span className="text-green-400 text-sm">📖</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Capítulo 156 de "Naruto" publicado</p>
                <p className="text-gray-400 text-xs">há 6 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}