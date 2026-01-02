import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Palette, FileText, DollarSign, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/socios', 
      label: 'Socios', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/artistas', 
      label: 'Artistas', 
      icon: <Palette size={20} /> 
    },
    { 
      path: '/admin/cupones', 
      label: 'Cupones', 
      icon: <FileText size={20} /> 
    },
    { 
      path: '/admin/pagos', 
      label: 'Pagos', 
      icon: <DollarSign size={20} /> 
    },
    { 
      path: '/admin/configuracion', 
      label: 'Configuración', 
      icon: <Settings size={20} /> 
    },
  ];

  return (
    <div className="bg-secondary text-white w-64 flex-shrink-0 h-screen sticky top-0">
      <div className="p-4 border-b border-secondary-dark">
        <h2 className="text-xl font-bold">Panel de Admin</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'hover:bg-secondary-dark text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          
          <li className="pt-4 mt-4 border-t border-secondary-dark">
            <button
              onClick={logout}
              className="flex items-center p-2 rounded-lg w-full text-left hover:bg-secondary-dark transition-colors"
            >
              <span className="mr-3"><LogOut size={20} /></span>
              <span>Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;