import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--color-bg)] border-b-2 border-[var(--color-red)] z-50 flex items-center justify-between h-16 px-8">
      <div className="flex items-center">
        <span className="flex items-center gap-2">
          <img src="/image/logo.png" alt="Logo XaodreScan" className="h-8 w-8 drop-shadow-[0_0_8px_#ff1744]" />
          <span className="text-[var(--color-red)] font-bold text-2xl drop-shadow-[var(--color-red-glow)]" style={{textShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>
            XaodreScan
          </span>
        </span>
      </div>
      <nav className="flex-1 flex justify-center">
        <ul className="flex gap-8 text-white font-medium text-lg">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/catalogo">Catálogo</Link></li>
          <li><Link href="/lancamentos">Lançamentos</Link></li>
        </ul>
      </nav>
      <div>
        <button className="bg-[var(--color-red)] hover:bg-[#b00610] text-white px-6 py-2 rounded font-semibold transition-colors shadow-lg" style={{boxShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>
          <Link href="/login" className="block w-full h-full">Login</Link>
        </button>
      </div>
    </header>
  );
}