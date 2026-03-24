import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, Plus, Bell, Map, User, Shield, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path) ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <Leaf className="w-7 h-7" />
            <span className="hidden sm:inline">EcoAlerta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkClass('/')}><Map className="w-4 h-4" /> Mapa</Link>
            {isAuthenticated && (
              <>
                <Link to="/incidents/new" className={linkClass('/incidents/new')}><Plus className="w-4 h-4" /> Reportar</Link>
                <Link to="/my-incidents" className={linkClass('/my-incidents')}>Mis Incidencias</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className={linkClass('/admin')}><Shield className="w-4 h-4" /> Admin</Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile/me" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                    {user?.display_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm">{user?.display_name?.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Cerrar sesión">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-700 border-t border-white/10 pb-4">
          <div className="px-4 pt-2 space-y-1">
            <Link to="/" className={linkClass('/')} onClick={() => setMenuOpen(false)}>
              <Map className="w-4 h-4" /> Mapa
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/incidents/new" className={linkClass('/incidents/new')} onClick={() => setMenuOpen(false)}>
                  <Plus className="w-4 h-4" /> Reportar incidencia
                </Link>
                <Link to="/my-incidents" className={linkClass('/my-incidents')} onClick={() => setMenuOpen(false)}>
                  Mis Incidencias
                </Link>
                <Link to="/profile/me" className={linkClass('/profile/me')} onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> Mi Perfil
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className={linkClass('/admin')} onClick={() => setMenuOpen(false)}>
                <Shield className="w-4 h-4" /> Panel Admin
              </Link>
            )}
            <div className="border-t border-white/10 pt-2 mt-2">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg text-sm">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg text-sm" onClick={() => setMenuOpen(false)}>
                  <LogIn className="w-4 h-4" /> Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
