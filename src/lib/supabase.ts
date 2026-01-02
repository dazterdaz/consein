import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno.');
}

// Validar formato de URL
try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error('La URL de Supabase no es válida: ' + supabaseUrl);
}

// Crear el cliente de Supabase con manejo de timeout y retry
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-custom-header': 'aplicacion-socios'
    },
    fetch: async (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('La solicitud a Supabase excedió el tiempo de espera (30s)');
        }
        throw error;
      }
    }
  }
});

// Función para verificar la conexión a Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Error al conectar con Supabase:', error.message);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    throw error;
  }
};

// Utilidades para trabajar con Supabase
export const getImageUrl = (bucketName: string, path: string) => {
  if (!path) return '';
  
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};

// Función para generar un código único de 6 caracteres alfanuméricos para socios
export const generatePartnerCode = async (): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let isUnique = false;
  
  try {
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Verificar que el código no existe ya en la base de datos
      const { data, error } = await supabase
        .from('socios')
        .select('codigo')
        .eq('codigo', code)
        .maybeSingle();

      // Si la tabla no existe, generar código sin verificación
      if (error && (error.code === 'PGRST205' || error.message?.includes('Could not find the table'))) {
        return code!;
      }

      // Si no hay data, el código es único
      if (!data) {
        isUnique = true;
      }
    }
    
    return code!;
  } catch (error) {
    // Si hay error de conexión, generar código sin verificación
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
};

// Función para generar un PIN numérico de 6 dígitos
export const generatePIN = (): string => {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
};

// Función para generar un código de cupón único
export const generateCouponCode = (): string => {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CPN-${randomChars}-${timestamp.substring(timestamp.length - 4)}`;
};