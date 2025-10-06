interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <img
      src="/image/logo.png"
      alt="Logo XaodreScan"
      width={size}
      height={size}
      className={`drop-shadow-[0_0_8px_#ff1744] ${className}`}
      loading="eager"
      onError={(e) => {
        console.error('Erro ao carregar logo:', e);
        // Fallback para um ícone de texto
        e.currentTarget.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.textContent = 'XS';
        fallback.className = 'w-8 h-8 bg-red-600 text-white flex items-center justify-center rounded font-bold';
        e.currentTarget.parentNode?.appendChild(fallback);
      }}
    />
  );
}
