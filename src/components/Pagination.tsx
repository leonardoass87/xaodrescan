"use client";

interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  onPageChange: (pagina: number) => void;
  loading?: boolean;
}

export default function Pagination({ 
  paginaAtual, 
  totalPaginas, 
  onPageChange, 
  loading = false 
}: PaginationProps) {
  const getPaginasVisiveis = () => {
    const paginas = [];
    const maxVisiveis = 5;
    
    if (totalPaginas <= maxVisiveis) {
      // Mostrar todas as páginas se total <= 5
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas com ellipsis
      if (paginaAtual <= 3) {
        // Páginas iniciais
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        // Páginas finais
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Páginas do meio
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  const paginasVisiveis = getPaginasVisiveis();

  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Botão Anterior */}
      <button
        onClick={() => onPageChange(paginaAtual - 1)}
        disabled={paginaAtual === 1 || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>←</span>
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Números das páginas */}
      <div className="flex items-center gap-1">
        {paginasVisiveis.map((pagina, index) => (
          <button
            key={index}
            onClick={() => typeof pagina === 'number' && onPageChange(pagina)}
            disabled={pagina === '...' || loading}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${pagina === paginaAtual
                ? 'bg-red-500 text-white'
                : typeof pagina === 'number'
                  ? 'text-gray-300 hover:bg-red-500/20 hover:text-white border border-red-500/30'
                  : 'text-gray-500 cursor-default'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {pagina}
          </button>
        ))}
      </div>

      {/* Botão Próximo */}
      <button
        onClick={() => onPageChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas || loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Próximo</span>
        <span>→</span>
      </button>
    </div>
  );
}
