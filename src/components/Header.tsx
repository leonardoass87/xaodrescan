"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-[var(--color-bg)] border-b-2 border-[var(--color-red)] z-50 flex items-center justify-between h-16 px-4 md:px-8">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <span className="flex items-center gap-2">
          <img src="/image/logo.png" alt="Logo XaodreScan" className="h-8 w-8 drop-shadow-[0_0_8px_#ff1744]" />
          <span className="text-[var(--color-red)] font-bold text-lg md:text-2xl drop-shadow-[var(--color-red-glow)]" style={{textShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>
            XaodreScan
          </span>
        </span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-1 justify-center">
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

      {/* Desktop User Actions */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
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

      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMenu}
        className={`md:hidden relative text-white hover:text-[var(--color-red)] transition-all duration-300 flex-shrink-0 ml-2 p-3 rounded-xl ${
          isMenuOpen 
            ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 shadow-lg' 
            : 'hover:bg-white/10'
        }`}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isMenuOpen ? 'rotate-45' : ''
          }`} />
          <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isMenuOpen ? 'opacity-0' : ''
          }`} />
          <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isMenuOpen ? '-rotate-45' : ''
          }`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-red-900/20 to-black/90 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300" onClick={toggleMenu} />
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed top-16 left-4 right-4 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border border-red-500/30 rounded-2xl z-50 md:hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <nav className="p-6">
            <ul className="space-y-2 text-white font-medium">
            <li>
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                  pathname === "/" 
                    ? "bg-gradient-to-r from-red-500/30 to-red-600/30 text-red-300 border border-red-500/50 shadow-lg" 
                    : "hover:bg-white/10 hover:text-red-300 hover:translate-x-1"
                }`}
                style={pathname === "/" ? {textShadow: '0 0 12px #ff1744', boxShadow: '0 0 20px rgba(255, 23, 68, 0.3)'} : {}}
              >
                <span className="text-lg">🏠</span>
                <span className="font-semibold">Home</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/catalogo" 
                onClick={() => setIsMenuOpen(false)}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                  pathname === "/catalogo" 
                    ? "bg-gradient-to-r from-red-500/30 to-red-600/30 text-red-300 border border-red-500/50 shadow-lg" 
                    : "hover:bg-white/10 hover:text-red-300 hover:translate-x-1"
                }`}
                style={pathname === "/catalogo" ? {textShadow: '0 0 12px #ff1744', boxShadow: '0 0 20px rgba(255, 23, 68, 0.3)'} : {}}
              >
                <span className="text-lg">📚</span>
                <span className="font-semibold">Catálogo</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/lancamentos" 
                onClick={() => setIsMenuOpen(false)}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                  pathname === "/lancamentos" 
                    ? "bg-gradient-to-r from-red-500/30 to-red-600/30 text-red-300 border border-red-500/50 shadow-lg" 
                    : "hover:bg-white/10 hover:text-red-300 hover:translate-x-1"
                }`}
                style={pathname === "/lancamentos" ? {textShadow: '0 0 12px #ff1744', boxShadow: '0 0 20px rgba(255, 23, 68, 0.3)'} : {}}
              >
                <span className="text-lg">🆕</span>
                <span className="font-semibold">Lançamentos</span>
              </Link>
            </li>
            {!isLoading && isAdmin() && (
              <li>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                    pathname.startsWith("/admin") 
                      ? "bg-gradient-to-r from-purple-500/30 to-purple-600/30 text-purple-300 border border-purple-500/50 shadow-lg" 
                      : "hover:bg-white/10 hover:text-purple-300 hover:translate-x-1"
                  }`}
                  style={pathname.startsWith("/admin") ? {textShadow: '0 0 12px #8b5cf6', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'} : {}}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-semibold">Admin</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile User Actions */}
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-red-500/30 to-transparent">
            {isLoading ? (
              <div className="flex items-center gap-3 text-white/70 py-3">
                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                <span className="text-sm">Carregando...</span>
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">{user.nome}</div>
                    {isAdmin() && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full">
                        <span>👑</span>
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-center flex items-center justify-center gap-2" 
                style={{boxShadow: '0 0 20px rgba(255, 23, 68, 0.4)'}}
              >
                <span>🔑</span>
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
        </div>
      )}
    </header>
  );
}