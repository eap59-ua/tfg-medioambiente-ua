import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, PlusCircle, User, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function MobileBottomNav() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // No renderizar en escritorio
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <nav className="flex justify-around items-center h-16 pointer-events-auto" aria-label="Navegación principal móvil">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
          aria-label="Mapa de incidencias"
        >
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-medium">Mapa</span>
        </Link>

        {isAuthenticated && (
          <Link 
            to="/incidents/new" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/incidents/new') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            aria-label="Reportar nueva incidencia"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Reportar</span>
          </Link>
        )}

        {isAuthenticated && !isAdmin && (
          <Link 
            to="/profile/me" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/profile/me') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            aria-label="Mi perfil"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Perfil</span>
          </Link>
        )}

        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/admin') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
            aria-label="Panel de administración"
          >
            <Shield className="w-6 h-6" />
            <span className="text-[10px] font-medium">Admin</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
