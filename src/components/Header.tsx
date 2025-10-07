"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Logo from "./Logo";
import { MiniSpinner } from "./LoadingSpinner";

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
          <Logo size={32} />
          <span className="text-[var(--color-red)] font-bold text-lg md:text-2xl drop-shadow-[var(--color-red-glow)]" style={{textShadow: '0 0 12px #ff1744, 0 0 24px #ff1744'}}>
            XaodreScan
          </span>
        </span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <ul className="flex gap-4 xl:gap-8 text-white font-medium text-base xl:text-lg">
          <li>
            <Link 
              href="/" 
              className={`relative px-6 py-3 font-medium transition-all duration-200 ${
                pathname === "/" 
                  ? "text-white bg-slate-800 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Home
              {pathname === "/" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </Link>
          </li>
          <li>
            <Link 
              href="/catalogo" 
              className={`relative px-6 py-3 font-medium transition-all duration-200 ${
                pathname === "/catalogo" 
                  ? "text-white bg-slate-800 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Catálogo
              {pathname === "/catalogo" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </Link>
          </li>
          <li>
            <Link 
              href="/lancamentos" 
              className={`relative px-6 py-3 font-medium transition-all duration-200 ${
                pathname === "/lancamentos" 
                  ? "text-white bg-slate-800 border-b-2 border-blue-500" 
                  : "text-gray-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Lançamentos
              {pathname === "/lancamentos" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
            </Link>
          </li>
          {user && (
            <li>
              <Link 
                href="/meus-favoritos" 
                className={`relative px-6 py-3 font-medium transition-all duration-200 ${
                  pathname === "/meus-favoritos" 
                    ? "text-white bg-slate-800 border-b-2 border-blue-500" 
                    : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Favoritos
                {pathname === "/meus-favoritos" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </Link>
            </li>
          )}
          {!isLoading && isAdmin && (
            <li>
              <Link 
                href="/admin" 
                className={`relative px-6 py-3 font-medium transition-all duration-200 ${
                  pathname.startsWith("/admin") 
                    ? "text-white bg-red-600 border-b-2 border-red-400" 
                    : "text-gray-400 hover:text-white hover:bg-red-600/50"
                }`}
              >
                Admin
                {pathname.startsWith("/admin") && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400"></div>
                )}
              </Link>
            </li>
          )}
          {/* Debug info removido para melhor performance */}
        </ul>
      </nav>

      {/* Desktop User Actions */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        {isLoading ? (
          <div className="flex items-center gap-2 text-white text-sm">
            <MiniSpinner size="sm" />
            <span>Carregando...</span>
          </div>
        ) : user ? (
          <>
            <span className="text-white text-sm">
              Olá, <span className="text-[var(--color-red)] font-semibold">{user.nome}</span>
              {isAdmin && <span className="ml-2 text-xs bg-[var(--color-red)] px-2 py-1 rounded">ADMIN</span>}
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
        className={`lg:hidden relative text-white hover:text-[var(--color-red)] transition-all duration-300 flex-shrink-0 ml-2 p-3 rounded-xl ${
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
        <div className="fixed top-16 left-4 right-4 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border border-red-500/30 rounded-2xl z-50 lg:hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <nav className="p-6">
            <ul className="space-y-2 text-white font-medium">
            <li>
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
                  pathname === "/" 
                    ? "bg-slate-800 text-white border-l-4 border-blue-500" 
                    : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="font-medium">Home</span>
                {pathname === "/" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </Link>
            </li>
            <li>
              <Link 
                href="/catalogo" 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
                  pathname === "/catalogo" 
                    ? "bg-slate-800 text-white border-l-4 border-blue-500" 
                    : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="font-medium">Catálogo</span>
                {pathname === "/catalogo" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </Link>
            </li>
            <li>
              <Link 
                href="/lancamentos" 
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
                  pathname === "/lancamentos" 
                    ? "bg-slate-800 text-white border-l-4 border-blue-500" 
                    : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span className="font-medium">Lançamentos</span>
                {pathname === "/lancamentos" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </Link>
            </li>
            {user && (
              <li>
                <Link 
                  href="/meus-favoritos" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
                    pathname === "/meus-favoritos" 
                      ? "bg-slate-800 text-white border-l-4 border-blue-500" 
                      : "text-gray-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span className="font-medium">Favoritos</span>
                  {pathname === "/meus-favoritos" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </Link>
              </li>
            )}
            {!isLoading && isAdmin && (
              <li>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
                    pathname.startsWith("/admin") 
                      ? "bg-red-600 text-white border-l-4 border-red-400" 
                      : "text-gray-400 hover:text-white hover:bg-red-600/50"
                  }`}
                >
                  <span className="font-medium">Admin</span>
                  {pathname.startsWith("/admin") && <div className="w-2 h-2 bg-red-400 rounded-full"></div>}
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile User Actions */}
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-red-500/30 to-transparent">
            {isLoading ? (
              <div className="flex items-center gap-3 text-white/70 py-3">
                <MiniSpinner size="sm" />
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
                    {isAdmin && (
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