/*
  # Crear esquema inicial del sistema de referidos

  1. Nuevas tablas:
    - `socios` - Socios comerciales registrados
    - `artistas` - Artistas del programa
    - `cupones` - Cupones generados
    - `pagos` - Registro de pagos a socios
    - `configuracion` - Configuración del sistema
    - `email_templates` - Plantillas de correos
    - `email_config` - Configuración SMTP

  2. Seguridad:
    - Habilitar RLS en todas las tablas
    - Crear políticas de acceso apropiadas

  3. Características:
    - IDs con UUID
    - Timestamps automáticos
    - Estados y controles de integridad
*/

-- Tabla de socios comerciales
CREATE TABLE IF NOT EXISTS socios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_local text NOT NULL,
  direccion text NOT NULL,
  nombre_contacto text NOT NULL,
  whatsapp text NOT NULL,
  instagram text NOT NULL,
  titular_cuenta text NOT NULL,
  rut text NOT NULL,
  banco text NOT NULL,
  tipo_cuenta text NOT NULL,
  numero_cuenta text NOT NULL,
  email text NOT NULL UNIQUE,
  codigo text NOT NULL UNIQUE,
  pin text NOT NULL,
  logo_url text,
  link text,
  activo boolean DEFAULT false,
  aprobado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de artistas
CREATE TABLE IF NOT EXISTS artistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  url_imagen text,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  socio_id uuid NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  artista_id uuid NOT NULL REFERENCES artistas(id) ON DELETE CASCADE,
  descuento numeric(5,2) NOT NULL,
  cantidad_usos integer DEFAULT 0,
  fecha_descarga timestamptz DEFAULT now(),
  fecha_uso timestamptz,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id uuid NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  monto numeric(12,2) NOT NULL,
  comision_porcentaje numeric(5,2) NOT NULL,
  razon text,
  fecha_pago timestamptz DEFAULT now(),
  estado text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave text NOT NULL UNIQUE,
  valor text NOT NULL,
  tipo text DEFAULT 'string',
  descripcion text,
  updated_at timestamptz DEFAULT now()
);

-- Tabla de plantillas de correo
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL UNIQUE,
  asunto text NOT NULL,
  contenido text NOT NULL,
  activo boolean DEFAULT true,
  variables text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de configuración SMTP
CREATE TABLE IF NOT EXISTS email_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL,
  puerto integer NOT NULL,
  usuario text NOT NULL,
  contrasena text NOT NULL,
  email_remitente text NOT NULL,
  nombre_remitente text NOT NULL,
  activo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE artistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para socios (todos pueden ver socios activos y aprobados)
CREATE POLICY "Todos pueden ver socios activos y aprobados"
  ON socios FOR SELECT
  TO public
  USING (activo = true AND aprobado = true);

-- Políticas RLS para artistas (todos pueden ver)
CREATE POLICY "Todos pueden ver artistas activos"
  ON artistas FOR SELECT
  TO public
  USING (activo = true);

-- Políticas RLS para cupones (todos pueden ver)
CREATE POLICY "Todos pueden ver cupones activos"
  ON cupones FOR SELECT
  TO public
  USING (activo = true);

-- Políticas RLS para pagos (solo lectura)
CREATE POLICY "Lectura de pagos"
  ON pagos FOR SELECT
  TO public
  USING (true);

-- Políticas RLS para configuración (solo lectura)
CREATE POLICY "Lectura de configuración"
  ON configuracion FOR SELECT
  TO public
  USING (true);

-- Políticas RLS para email_templates (solo lectura)
CREATE POLICY "Lectura de plantillas de correo"
  ON email_templates FOR SELECT
  TO public
  USING (true);

-- Políticas RLS para email_config (solo lectura)
CREATE POLICY "Lectura de configuración de correo"
  ON email_config FOR SELECT
  TO public
  USING (true);

-- Crear índices
CREATE INDEX idx_socios_codigo ON socios(codigo);
CREATE INDEX idx_socios_email ON socios(email);
CREATE INDEX idx_socios_activo_aprobado ON socios(activo, aprobado);
CREATE INDEX idx_cupones_socio ON cupones(socio_id);
CREATE INDEX idx_cupones_artista ON cupones(artista_id);
CREATE INDEX idx_pagos_socio ON pagos(socio_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX idx_configuracion_clave ON configuracion(clave);

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
  ('porcentaje_comision', '10', 'number', 'Porcentaje de comisión para socios'),
  ('nombre_empresa', 'Sistema de Referidos', 'string', 'Nombre de la empresa'),
  ('email_contacto', 'contacto@empresa.com', 'string', 'Email de contacto')
ON CONFLICT (clave) DO NOTHING;

-- Insertar plantillas de correo predeterminadas
INSERT INTO email_templates (tipo, asunto, contenido, variables) VALUES
  (
    'registro',
    'Bienvenido {{nombre_local}} - Tu solicitud ha sido recibida',
    '<p>Hola {{nombre_contacto}},</p><p>Gracias por registrarte como socio comercial. Tu solicitud ha sido recibida y está siendo revisada por nuestro equipo administrativo.</p><p><strong>Datos de tu registro:</strong></p><ul><li>Nombre Local: {{nombre_local}}</li><li>Código: {{codigo}}</li><li>PIN: {{pin}}</li></ul><p>Te notificaremos pronto sobre el estado de tu solicitud.</p>',
    '{{nombre_local}},{{nombre_contacto}},{{codigo}},{{pin}}'
  ),
  (
    'aprobacion',
    '¡Felicidades! Tu perfil ha sido aprobado',
    '<p>Hola {{nombre_contacto}},</p><p>Nos complace informarte que tu perfil de socio comercial ha sido aprobado.</p><p><strong>Datos de acceso:</strong></p><ul><li>Código: {{codigo}}</li><li>PIN: {{pin}}</li></ul><p>Tu cuenta será activada pronto para que comiences a generar comisiones.</p>',
    '{{nombre_local}},{{nombre_contacto}},{{codigo}},{{pin}}'
  ),
  (
    'activacion',
    '¡Tu cuenta está lista! Comienza a generar comisiones',
    '<p>Hola {{nombre_contacto}},</p><p>¡Excelente noticia! Tu cuenta de socio comercial ha sido activada y ya puedes comenzar a operar.</p><p><strong>Datos de acceso:</strong></p><ul><li>Código: {{codigo}}</li><li>PIN: {{pin}}</li></ul><p>Accede a tu portal para comenzar a generar comisiones.</p>',
    '{{nombre_local}},{{nombre_contacto}},{{codigo}},{{pin}}'
  )
ON CONFLICT (tipo) DO NOTHING;
