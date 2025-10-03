"use client";

interface MangaImageProps {
  titulo: string;
  cor?: string;
  className?: string;
}

export default function MangaImage({ titulo, cor = "#ff1744", className = "" }: MangaImageProps) {
  // Gerar cor baseada no título para consistência
  const getCorBaseadaNoTitulo = (titulo: string) => {
    const cores = [
      "#ff1744", // Vermelho
      "#ff6b35", // Laranja
      "#ffd700", // Dourado
      "#2c3e50", // Azul escuro
      "#8e44ad", // Roxo
      "#3498db", // Azul
      "#2ecc71", // Verde
      "#e74c3c", // Vermelho escuro
      "#9b59b6", // Roxo claro
      "#1abc9c", // Turquesa
      "#e67e22", // Laranja escuro
      "#16a085", // Verde escuro
      "#c0392b", // Vermelho escuro
      "#27ae60", // Verde
      "#8e44ad", // Roxo
      "#673ab7", // Roxo médio
      "#ff5722", // Laranja
      "#795548", // Marrom
      "#607d8b", // Azul acinzentado
      "#3f51b5"  // Azul índigo
    ];
    
    let hash = 0;
    for (let i = 0; i < titulo.length; i++) {
      hash = titulo.charCodeAt(i) + ((hash << 5) - hash);
    }
    return cores[Math.abs(hash) % cores.length];
  };

  const corFinal = getCorBaseadaNoTitulo(titulo);
  const textoCor = corFinal === "#ffd700" ? "#000000" : "#ffffff";

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 400"
        className="rounded-lg"
      >
        {/* Fundo com gradiente */}
        <defs>
          <linearGradient id={`gradient-${titulo.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={corFinal} stopOpacity="0.9" />
            <stop offset="100%" stopColor={corFinal} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        
        {/* Retângulo de fundo */}
        <rect width="300" height="400" fill={`url(#gradient-${titulo.replace(/\s+/g, '')})`} />
        
        {/* Padrão decorativo */}
        <circle cx="50" cy="50" r="20" fill={textoCor} fillOpacity="0.1" />
        <circle cx="250" cy="350" r="30" fill={textoCor} fillOpacity="0.1" />
        <rect x="200" y="50" width="40" height="40" fill={textoCor} fillOpacity="0.1" transform="rotate(45 220 70)" />
        
        {/* Texto do título */}
        <text
          x="150"
          y="200"
          textAnchor="middle"
          fill={textoCor}
          fontSize="24"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          className="select-none"
        >
          {titulo.split(' ').map((palavra, index) => (
            <tspan key={index} x="150" dy={index === 0 ? 0 : 30}>
              {palavra}
            </tspan>
          ))}
        </text>
        
        {/* Ícone de mangá */}
        <g transform="translate(150, 280)">
          <rect x="-15" y="-15" width="30" height="30" fill={textoCor} fillOpacity="0.2" rx="5" />
          <text x="0" y="5" textAnchor="middle" fill={textoCor} fontSize="16" fontWeight="bold">
            📚
          </text>
        </g>
      </svg>
    </div>
  );
}
