import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useConfig();
  
  // Temporary: simulate no user until AuthProvider is properly set up
  const user = null;
  const handleLogout = () => {
    // Temporary placeholder
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {config?.logo_url ? (
                <img 
                  src={config.logo_url} 
                  alt={config.nombre_sitio} 
                  className="h-8 w-auto mr-2"
                />
              ) : (
                <div className="text-accent text-2xl mr-2">
                  <User />
                </div>
              )}
              <span className="font-bold text-xl">{config?.nombre_sitio || 'Sistema de Referidos'}</span>
            </Link>
          </div>

          {/* Enlaces de navegación para pantallas grandes */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-accent transition-colors py-2">
              Inicio
            </Link>
            <Link to="/registro-socio" className="hover:text-accent transition-colors py-2">
              Registrarse como Socio
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin\" className="hover:text-accent transition-colors py-2">
                    Panel de Administración
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut size={18} className="mr-1" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/portal-socio" className="hover:text-accent transition-colors py-2">
                  Portal de Socios
                </Link>
                <Link to="/login" className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors">
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>

          {/* Botón de menú para móviles */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white hover:text-accent focus:outline-none"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="flex flex-col space-y-2 pb-4">
              <Link 
                to="/" 
                className="hover:bg-secondary-dark px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/registro-socio" 
                className="hover:bg-secondary-dark px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Registrarse como Socio
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="hover:bg-secondary-dark px-3 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Panel de Administración
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center bg-primary hover:bg-primary-dark px-3 py-2 rounded-md text-left"
                  >
                    <LogOut size={18} className="mr-1" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/portal-socio" 
                    className="hover:bg-secondary-dark px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Portal de Socios
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-primary hover:bg-primary-dark px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;