import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateSocio } from '../lib/database';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; username: string; role: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginSocio: (codigo: string, pin: string) => Promise<{ success: boolean; message: string; socioId?: string }>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Verificar si las tablas existen primero
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single();

      // Si la tabla no existe (error PGRST205), usar credenciales por defecto
      if (error && error.code === 'PGRST205') {
        // Credenciales por defecto para desarrollo
        if (username === 'Demian' && password === 'Llamasami152616') {
          const userData = {
            id: 'default-admin-id',
            username: 'Demian',
            role: 'admin'
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          return { success: true, message: 'Inicio de sesión exitoso (modo desarrollo)' };
        }
        return { success: false, message: 'Credenciales incorrectas' };
      }

      if (error || !data) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // En una implementación real, deberías comparar hashes de contraseñas
      if (data.password_hash !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      const userData = {
        id: data.id,
        username: data.username,
        role: data.rol
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      // Verificar si el error es por tabla no encontrada
      if (error && (error.message?.includes('Could not find the table') ||
                   error.message?.includes('PGRST205'))) {
        // Credenciales por defecto para desarrollo
        if (username === 'Demian' && password === 'Llamasami152616') {
          const userData = {
            id: 'default-admin-id',
            username: 'Demian',
            role: 'admin'
          };

          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));

          return { success: true, message: 'Inicio de sesión exitoso (modo desarrollo)' };
        }
        return { success: false, message: 'Credenciales incorrectas' };
      }
      
      console.error('Error de inicio de sesión:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  const loginSocio = async (codigo: string, pin: string) => {
    try {
      const data = await authenticateSocio(codigo, pin);
      
      if (!data) {
        return { success: false, message: 'Credenciales inválidas o socio inactivo' };
      }

      const userData = {
        id: data.id,
        username: data.nombre_local,
        role: 'socio'
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { 
        success: true, 
        message: 'Inicio de sesión exitoso',
        socioId: data.id
      };
    } catch (error) {
      console.error('Error de inicio de sesión de socio:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginSocio, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};