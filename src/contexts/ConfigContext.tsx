import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConfig, updateConfig as updateConfigDB, Config } from '../lib/database';

interface ConfigContextType {
  config: Config | null;
  loading: boolean;
  error: string | null;
  updateConfig: (newConfig: Partial<Config>) => Promise<{ success: boolean; message: string }>;
  retryFetch: () => Promise<void>;
}

const defaultConfig: Config = {
  id: '1',
  nombre_sitio: 'Sistema de Referidos',
  logo_url: null,
  footer_texto1: '© 2025 Sistema de Referidos',
  footer_texto2: 'Versión: 1.7',
  footer_texto3: 'Por: Daz The Line',
  footer_texto4: 'Ver detalles: www.daz.cl',
  porcentaje_comision: 10
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchConfig = async () => {
    try {
      const data = await getConfig();
      if (data) {
        setConfig(data);
      } else {
        // Si no hay configuración, usar la por defecto
        setConfig(defaultConfig);
      }
      
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.warn('No se pudo cargar la configuración, usando valores por defecto:', error);
      
      // En caso de error, usar configuración por defecto y no mostrar error
      setConfig(defaultConfig);
      setError(null);
      
      // Solo mostrar error si es crítico y no podemos continuar
      // if (retryCount < MAX_RETRIES) {
      //   console.log(`Reintentando en ${RETRY_DELAY}ms (intento ${retryCount + 1}/${MAX_RETRIES})...`);
      //   setRetryCount(prev => prev + 1);
      //   setTimeout(fetchConfig, RETRY_DELAY);
      // }
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<Config>) => {
    try {
      await updateConfigDB(newConfig);

      setConfig(prev => prev ? { ...prev, ...newConfig } : null);
      return { success: true, message: 'Configuración actualizada con éxito' };
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      return { 
        success: false, 
        message: `Error al actualizar la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  };

  return (
    <ConfigContext.Provider value={{ config, loading, error, updateConfig, retryFetch }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
};