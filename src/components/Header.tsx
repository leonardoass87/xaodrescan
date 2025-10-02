"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };
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
          <li>
            <Link 
              href="/" 
              className={`transition-colors ${
                pathname === "/" 
                  ? "text-[var(--color-red)] font-bold" 
                  : "hover:text-[var(--color-red)]"
              }`}
              style={pathname === "/" ? {textShadow: '0 0 8px #ff1744'} : {}}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              href="/catalogo" 
              className={`transition-colors ${
                pathname === "/catalogo" 
                  ? "text-[var(--color-red)] font-bold" 
                  : "hover:text-[var(--color-red)]"
              }`}
              style={pathname === "/catalogo" ? {textShadow: '0 0 8px #ff1744'} : {}}
            >
              Catálogo
            </Link>
          </li>
          <li>
            <Link 
              href="/lancamentos" 
              className={`transition-colors ${
                pathname === "/lancamentos" 
                  ? "text-[var(--color-red)] font-bold" 
                  : "hover:text-[var(--color-red)]"
              }`}
              style={pathname === "/lancamentos" ? {textShadow: '0 0 8px #ff1744'} : {}}
            >
              Lançamentos
            </Link>
          </li>
          {!isLoading && isAdmin() && (
            <li>
              <Link 
                href="/admin" 
                className={`transition-all duration-300 ${
                  pathname.startsWith("/admin") 
                    ? "bg-purple-600 text-white font-bold px-4 py-2 rounded-lg shadow-[0_0_20px_#8b5cf6,0_0_40px_#8b5cf6] border-2 border-yellow-400" 
                    : "hover:text-[#ff0033] text-white bg-red-500 px-2 py-1 rounded"
                }`}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="text-white text-sm">Carregando...</div>
        ) : user ? (
          <>
            <span className="text-white text-sm">
              Olá, <span className="text-[var(--color-red)] font-semibold">{user.nome}</span>
              {isAdmin() && <span className="ml-2 text-xs bg-[var(--color-red)] px-2 py-1 rounded">ADMIN</span>}
            </span>
            <button 
              onClick={logout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button className="bg-[var(--color-red)] hover:bg-[#b00610] text-white px-6 py-2 rounded font-semibold transition-colors shadow-lg" style={{boxShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>
            <Link href="/login" className="block w-full h-full">Login</Link>
          </button>
        )}
      </div>
    </header>
  );
}