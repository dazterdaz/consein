/*
  # Crear tablas principales del sistema de referidos

  1. Nuevas Tablas
    - `artistas`
      - `id` (uuid, primary key)
      - `nombre` (text) - Nombre del artista
      - `activo` (boolean) - Estado activo/inactivo
      - `created_at` (timestamptz) - Fecha de creación
    
    - `socios`
      - `id` (uuid, primary key)
      - `codigo` (text, unique) - Código único del socio
      - `nombre_local` (text) - Nombre del local/negocio
      - `nombre_contacto` (text) - Nombre de la persona de contacto
      - `whatsapp` (text) - Número de WhatsApp
      - `instagram` (text, nullable) - Usuario de Instagram
      - `email` (text, nullable) - Correo electrónico
      - `direccion` (text, nullable) - Dirección física
      - `imagen_local` (text, nullable) - URL de imagen del local
      - `activo` (boolean) - Estado activo/inactivo
      - `aprobado` (boolean) - Estado de aprobación
      - `created_at` (timestamptz) - Fecha de creación
    
    - `cupones`
      - `id` (uuid, primary key)
      - `codigo` (text, unique) - Código único del cupón
      - `socio_id` (uuid) - Referencia al socio
      - `cliente_nombre` (text) - Nombre del cliente
      - `cliente_whatsapp` (text) - WhatsApp del cliente
      - `cliente_instagram` (text, nullable) - Instagram del cliente
      - `estado` (text) - Estado: descargado, agendado, cobrado
      - `fecha_descarga` (timestamptz) - Fecha de descarga
      - `fecha_agendado` (timestamptz, nullable) - Fecha de agendado
      - `fecha_cobrado` (timestamptz, nullable) - Fecha de cobro
      - `artista_id` (uuid, nullable) - Referencia al artista
      - `valor_tatuaje` (numeric, nullable) - Valor del tatuaje
      - `created_at` (timestamptz) - Fecha de creación
    
    - `pagos`
      - `id` (uuid, primary key)
      - `socio_id` (uuid) - Referencia al socio
      - `monto` (numeric) - Monto del pago
      - `fecha_pago` (date) - Fecha del pago
      - `notas` (text, nullable) - Notas adicionales
      - `created_at` (timestamptz) - Fecha de creación

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas restrictivas: solo usuarios autenticados pueden acceder
    - Políticas de lectura y escritura separadas
    - Los socios públicos pueden crear registros y leer su propia información
*/

-- Crear tabla de artistas
CREATE TABLE IF NOT EXISTS artistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en artistas
ALTER TABLE artistas ENABLE ROW LEVEL SECURITY;

-- Políticas para artistas
CREATE POLICY "Usuarios autenticados pueden ver artistas"
  ON artistas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear artistas"
  ON artistas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar artistas"
  ON artistas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar artistas"
  ON artistas FOR DELETE
  TO authenticated
  USING (true);

-- Crear tabla de socios
CREATE TABLE IF NOT EXISTS socios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nombre_local text NOT NULL,
  nombre_contacto text NOT NULL,
  whatsapp text NOT NULL,
  instagram text,
  email text,
  direccion text,
  imagen_local text,
  activo boolean NOT NULL DEFAULT false,
  aprobado boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en socios
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;

-- Políticas para socios
CREATE POLICY "Cualquiera puede ver socios activos y aprobados"
  ON socios FOR SELECT
  TO public
  USING (activo = true AND aprobado = true);

CREATE POLICY "Usuarios autenticados pueden ver todos los socios"
  ON socios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cualquiera puede registrarse como socio"
  ON socios FOR INSERT
  TO public
  WITH CHECK (activo = false AND aprobado = false);

CREATE POLICY "Usuarios autenticados pueden actualizar socios"
  ON socios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar socios"
  ON socios FOR DELETE
  TO authenticated
  USING (true);

-- Crear tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  socio_id uuid NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  cliente_nombre text NOT NULL,
  cliente_whatsapp text NOT NULL,
  cliente_instagram text,
  estado text NOT NULL DEFAULT 'descargado' CHECK (estado IN ('descargado', 'agendado', 'cobrado')),
  fecha_descarga timestamptz NOT NULL DEFAULT now(),
  fecha_agendado timestamptz,
  fecha_cobrado timestamptz,
  artista_id uuid REFERENCES artistas(id) ON DELETE SET NULL,
  valor_tatuaje numeric,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en cupones
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

-- Políticas para cupones
CREATE POLICY "Cualquiera puede crear cupones"
  ON cupones FOR INSERT
  TO public
  WITH CHECK (estado = 'descargado');

CREATE POLICY "Usuarios autenticados pueden ver todos los cupones"
  ON cupones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cupones"
  ON cupones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar cupones"
  ON cupones FOR DELETE
  TO authenticated
  USING (true);

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id uuid NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  monto numeric NOT NULL CHECK (monto > 0),
  fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en pagos
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas para pagos
CREATE POLICY "Usuarios autenticados pueden ver todos los pagos"
  ON pagos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagos"
  ON pagos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
  ON pagos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pagos"
  ON pagos FOR DELETE
  TO authenticated
  USING (true);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cupones_socio_id ON cupones(socio_id);
CREATE INDEX IF NOT EXISTS idx_cupones_artista_id ON cupones(artista_id);
CREATE INDEX IF NOT EXISTS idx_cupones_estado ON cupones(estado);
CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_socios_codigo ON socios(codigo);
CREATE INDEX IF NOT EXISTS idx_pagos_socio_id ON pagos(socio_id);
