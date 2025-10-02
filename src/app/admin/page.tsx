export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-red-500/20 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-400">Bem-vindo ao painel de controle do XaodreScan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total de Usuários</p>
              <p className="text-2xl font-bold text-white mt-1">1,234</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <span className="text-red-400 text-xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400">+12%</span>
            <span className="text-gray-400 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total de Mangás</p>
              <p className="text-2xl font-bold text-white mt-1">567</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <span className="text-red-400 text-xl">📚</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400">+8%</span>
            <span className="text-gray-400 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Capítulos Publicados</p>
              <p className="text-2xl font-bold text-white mt-1">2,891</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <span className="text-red-400 text-xl">📄</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400">+15%</span>
            <span className="text-gray-400 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Visualizações Hoje</p>
              <p className="text-2xl font-bold text-white mt-1">45,678</p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <span className="text-red-400 text-xl">👁️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-400">+23%</span>
            <span className="text-gray-400 ml-2">vs ontem</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">➕</span>
                <span className="text-white">Adicionar Novo Mangá</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">👤</span>
                <span className="text-white">Gerenciar Usuários</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all duration-200 text-left">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">📊</span>
                <span className="text-white">Ver Relatórios</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Novo usuário registrado</p>
                <p className="text-gray-400 text-xs">há 5 minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Capítulo 145 de "One Piece" publicado</p>
                <p className="text-gray-400 text-xs">há 1 hora</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Backup do sistema concluído</p>
                <p className="text-gray-400 text-xs">há 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Novo mangá "Attack on Titan" adicionado</p>
                <p className="text-gray-400 text-xs">há 3 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}