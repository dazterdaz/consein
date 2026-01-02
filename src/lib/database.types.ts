export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      socios: {
        Row: {
          id: string
          created_at: string
          nombre_local: string
          direccion: string
          nombre_encargado: string
          telefono: string
          instagram: string
          titular_cuenta: string
          rut: string
          banco: string
          tipo_cuenta: string
          numero_cuenta: string
          email: string
          codigo: string
          pin: string
          logo_url: string | null
          link: string | null
          activo: boolean
          aprobado: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          nombre_local: string
          direccion: string
          nombre_encargado: string
          telefono: string
          instagram: string
          titular_cuenta: string
          rut: string
          banco: string
          tipo_cuenta: string
          numero_cuenta: string
          email: string
          codigo: string
          pin: string
          logo_url?: string | null
          link?: string | null
          activo?: boolean
          aprobado?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          nombre_local?: string
          direccion?: string
          nombre_encargado?: string
          telefono?: string
          instagram?: string
          titular_cuenta?: string
          rut?: string
          banco?: string
          tipo_cuenta?: string
          numero_cuenta?: string
          email?: string
          codigo?: string
          pin?: string
          logo_url?: string | null
          link?: string | null
          activo?: boolean
          aprobado?: boolean
        }
      }
      cupones: {
        Row: {
          id: string
          created_at: string
          codigo: string
          socio_id: string
          cliente_nombre: string
          cliente_whatsapp: string
          cliente_instagram: string
          estado: 'descargado' | 'agendado' | 'cobrado'
          fecha_descarga: string
          fecha_agendado: string | null
          fecha_cobrado: string | null
          artista_id: string | null
          valor_tatuaje: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          codigo: string
          socio_id: string
          cliente_nombre: string
          cliente_whatsapp: string
          cliente_instagram: string
          estado?: 'descargado' | 'agendado' | 'cobrado'
          fecha_descarga?: string
          fecha_agendado?: string | null
          fecha_cobrado?: string | null
          artista_id?: string | null
          valor_tatuaje?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          codigo?: string
          socio_id?: string
          cliente_nombre?: string
          cliente_whatsapp?: string
          cliente_instagram?: string
          estado?: 'descargado' | 'agendado' | 'cobrado'
          fecha_descarga?: string
          fecha_agendado?: string | null
          fecha_cobrado?: string | null
          artista_id?: string | null
          valor_tatuaje?: number | null
        }
      }
      artistas: {
        Row: {
          id: string
          created_at: string
          nombre: string
          activo: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          nombre: string
          activo?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          nombre?: string
          activo?: boolean
        }
      }
      pagos: {
        Row: {
          id: string
          created_at: string
          socio_id: string
          monto: number
          fecha_pago: string
          notas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          socio_id: string
          monto: number
          fecha_pago: string
          notas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          socio_id?: string
          monto?: number
          fecha_pago?: string
          notas?: string | null
        }
      }
      configuracion: {
        Row: {
          id: string
          nombre_sitio: string
          logo_url: string | null
          footer_texto1: string
          footer_texto2: string
          footer_texto3: string
          footer_texto4: string
          porcentaje_comision: number
        }
        Insert: {
          id?: string
          nombre_sitio: string
          logo_url?: string | null
          footer_texto1: string
          footer_texto2: string
          footer_texto3: string
          footer_texto4: string
          porcentaje_comision: number
        }
        Update: {
          id?: string
          nombre_sitio?: string
          logo_url?: string | null
          footer_texto1?: string
          footer_texto2?: string
          footer_texto3?: string
          footer_texto4?: string
          porcentaje_comision?: number
        }
      }
      usuarios: {
        Row: {
          id: string
          created_at: string
          username: string
          password_hash: string
          rol: 'admin' | 'socio'
        }
        Insert: {
          id?: string
          created_at?: string
          username: string
          password_hash: string
          rol: 'admin' | 'socio'
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          password_hash?: string
          rol?: 'admin' | 'socio'
        }
      }
    }
  }
}