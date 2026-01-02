import { supabase } from './supabase';

// Tipos de datos
export interface Config {
  id: string;
  nombre_sitio: string;
  logo_url: string | null;
  footer_texto1: string;
  footer_texto2: string;
  footer_texto3: string;
  footer_texto4: string;
  porcentaje_comision: number;
  created_at?: string;
  updated_at?: string;
}

export interface Socio {
  id: string;
  nombre_local: string;
  direccion: string;
  nombre_encargado: string;
  telefono: string;
  instagram: string;
  titular_cuenta: string;
  rut: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  email: string;
  codigo: string;
  pin: string;
  logo_url: string | null;
  link: string | null;
  activo: boolean;
  aprobado: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Cupon {
  id: string;
  codigo: string;
  socio_id: string;
  cliente_nombre: string;
  cliente_whatsapp: string;
  cliente_instagram: string;
  estado: 'descargado' | 'agendado' | 'cobrado';
  fecha_descarga: string;
  fecha_agendado: string | null;
  fecha_cobrado: string | null;
  artista_id: string | null;
  valor_tatuaje: number | null;
  created_at: string;
  updated_at?: string;
}

export interface Artista {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Pago {
  id: string;
  socio_id: string;
  monto: number;
  fecha_pago: string;
  notas: string | null;
  created_at: string;
  updated_at?: string;
}

// Funciones de configuración
export const getConfig = async (): Promise<Config | null> => {
  try {
    // Obtener todas las configuraciones y mapearlas
    const { data: configData, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('clave');

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return null;
      }
      console.warn('No se pudo cargar la configuración:', error.message);
      return null;
    }

    if (!configData || configData.length === 0) {
      return null;
    }

    // Mapear los datos de la tabla a un objeto Config
    const config: Config = {
      id: '1',
      nombre_sitio: 'Sistema de Referidos',
      logo_url: null,
      footer_texto1: '© 2025 Sistema de Referidos',
      footer_texto2: 'Versión: 1.7',
      footer_texto3: 'Por: Daz The Line',
      footer_texto4: 'Ver detalles: www.daz.cl',
      porcentaje_comision: 10
    };

    // Actualizar valores desde la base de datos
    configData.forEach((item: any) => {
      if (item.clave === 'nombre_sitio') config.nombre_sitio = item.valor;
      if (item.clave === 'logo_url') config.logo_url = item.valor || null;
      if (item.clave === 'footer_texto1') config.footer_texto1 = item.valor;
      if (item.clave === 'footer_texto2') config.footer_texto2 = item.valor;
      if (item.clave === 'footer_texto3') config.footer_texto3 = item.valor;
      if (item.clave === 'footer_texto4') config.footer_texto4 = item.valor;
      if (item.clave === 'porcentaje_comision') config.porcentaje_comision = parseInt(item.valor);
    });

    return config;
  } catch (error) {
    return null;
  }
};

export const updateConfig = async (newConfig: Partial<Config>): Promise<void> => {
  try {
    // Actualizar cada valor de configuración de forma individual
    const updates = [];

    if (newConfig.nombre_sitio) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.nombre_sitio })
          .eq('clave', 'nombre_sitio')
      );
    }

    if (newConfig.logo_url !== undefined) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.logo_url || '' })
          .eq('clave', 'logo_url')
      );
    }

    if (newConfig.footer_texto1) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.footer_texto1 })
          .eq('clave', 'footer_texto1')
      );
    }

    if (newConfig.footer_texto2) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.footer_texto2 })
          .eq('clave', 'footer_texto2')
      );
    }

    if (newConfig.footer_texto3) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.footer_texto3 })
          .eq('clave', 'footer_texto3')
      );
    }

    if (newConfig.footer_texto4) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.footer_texto4 })
          .eq('clave', 'footer_texto4')
      );
    }

    if (newConfig.porcentaje_comision) {
      updates.push(
        supabase.from('configuracion')
          .update({ valor: newConfig.porcentaje_comision.toString() })
          .eq('clave', 'porcentaje_comision')
      );
    }

    // Ejecutar todas las actualizaciones
    if (updates.length > 0) {
      const results = await Promise.all(updates);

      for (const result of results) {
        if (result.error) throw result.error;
      }
    }
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

// Funciones de socios
export const getSocios = async (filters?: { activo?: boolean; aprobado?: boolean }): Promise<Socio[]> => {
  try {
    let query = supabase.from('socios').select('*');
    
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }
    
    if (filters?.aprobado !== undefined) {
      query = query.eq('aprobado', filters.aprobado);
    }
    
    const { data, error } = await query.order('nombre_local');
    
    if (error) {
      // Si la tabla no existe o hay errores de conexión, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        // Tabla no existe - esto es normal durante el desarrollo inicial
        return [];
      }
      console.warn('No se pudieron cargar los socios:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const getSocioByCode = async (codigo: string): Promise<Socio | null> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('codigo', codigo)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener socio por código:', error);
    throw error;
  }
};

export const authenticateSocio = async (codigo: string, pin: string): Promise<Socio | null> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('codigo', codigo)
      .eq('pin', pin)
      .eq('activo', true)
      .eq('aprobado', true)
      .single();
    
    // Si la tabla no existe, retornar null
    if (error && error.code === 'PGRST205') {
      return null;
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    // Verificar si el error es por tabla no encontrada
    if (error && (error.message?.includes('Could not find the table') || 
                 error.message?.includes('PGRST205'))) {
      return null;
    }
    
    console.error('Error al autenticar socio:', error);
    throw error;
  }
};

export const getSocioById = async (id: string): Promise<Socio | null> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener socio:', error);
    throw error;
  }
};

export const createSocio = async (socio: Omit<Socio, 'id' | 'created_at'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .insert([socio])
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error al crear socio:', error);
    throw error;
  }
};

export const updateSocio = async (id: string, socio: Partial<Socio>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('socios')
      .update(socio)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar socio:', error);
    throw error;
  }
};

export const deleteSocio = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('socios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    throw error;
  }
};

// Funciones de cupones
export const getCupones = async (): Promise<Cupon[]> => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .order('fecha_descarga', { ascending: false });
    
    if (error) {
      // Si la tabla no existe, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return [];
      }
      console.warn('No se pudieron cargar los cupones:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const getCuponesBySocio = async (socioId: string): Promise<Cupon[]> => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .select('*')
      .eq('socio_id', socioId)
      .order('fecha_descarga', { ascending: false });
    
    if (error) {
      // Si la tabla no existe, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return [];
      }
      console.warn('No se pudieron cargar los cupones del socio:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const createCupon = async (cupon: Omit<Cupon, 'id' | 'created_at'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('cupones')
      .insert([cupon])
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error al crear cupón:', error);
    throw error;
  }
};

export const updateCupon = async (id: string, cupon: Partial<Cupon>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cupones')
      .update(cupon)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar cupón:', error);
    throw error;
  }
};

// Funciones de artistas
export const getArtistas = async (): Promise<Artista[]> => {
  try {
    const { data, error } = await supabase
      .from('artistas')
      .select('*')
      .order('nombre');
    
    if (error) {
      // Si la tabla no existe, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return [];
      }
      console.warn('No se pudieron cargar los artistas:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const getArtistaById = async (id: string): Promise<Artista | null> => {
  try {
    const { data, error } = await supabase
      .from('artistas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return null;
      }
      if (error.code === 'PGRST116') {
        return null;
      }
      console.warn('No se pudo obtener el artista:', error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return null;
  }
};

export const createArtista = async (artista: Omit<Artista, 'id' | 'created_at'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('artistas')
      .insert([artista])
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error al crear artista:', error);
    throw error;
  }
};

export const updateArtista = async (id: string, artista: Partial<Artista>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('artistas')
      .update(artista)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar artista:', error);
    throw error;
  }
};

export const deleteArtista = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('artistas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar artista:', error);
    throw error;
  }
};

// Funciones de pagos
export const getPagos = async (): Promise<Pago[]> => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('fecha_pago', { ascending: false });
    
    if (error) {
      // Si la tabla no existe, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return [];
      }
      console.warn('No se pudieron cargar los pagos:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const getPagosBySocio = async (socioId: string): Promise<Pago[]> => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('socio_id', socioId)
      .order('fecha_pago', { ascending: false });
    
    if (error) {
      // Si la tabla no existe, retornar array vacío silenciosamente
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return [];
      }
      console.warn('No se pudieron cargar los pagos del socio:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    // Error de red o conexión - manejar silenciosamente
    return [];
  }
};

export const createPago = async (pago: Omit<Pago, 'id' | 'created_at'>): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pago])
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error al crear pago:', error);
    throw error;
  }
};

// Funciones de almacenamiento
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw error;
  }
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
        .single();
      
      // Si la tabla no existe, generar código sin verificación
      if (error && (error.code === 'PGRST205' || error.message?.includes('Could not find the table'))) {
        return code!;
      }
      
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