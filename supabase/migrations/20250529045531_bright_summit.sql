-- Eliminar políticas existentes
DROP POLICY IF EXISTS "enable_public_read" ON public.configuracion;
DROP POLICY IF EXISTS "enable_initial_insert" ON public.configuracion;
DROP POLICY IF EXISTS "enable_admin_update" ON public.configuracion;

-- Asegurar que la tabla tiene la estructura correcta
ALTER TABLE public.configuracion ALTER COLUMN id SET DEFAULT '1';
ALTER TABLE public.configuracion ADD CONSTRAINT configuracion_id_check CHECK (id = '1');
ALTER TABLE public.configuracion ADD CONSTRAINT single_row_check UNIQUE (id);

-- Crear nuevas políticas mejoradas
CREATE POLICY "allow_public_read"
  ON public.configuracion
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_initial_insert"
  ON public.configuracion
  FOR INSERT
  TO public
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.configuracion) AND
    id = '1'
  );

CREATE POLICY "allow_admin_update"
  ON public.configuracion
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) = 'admin'::text AND
    id = '1'
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'admin'::text AND
    id = '1'
  );

-- Crear función para asegurar configuración inicial
CREATE OR REPLACE FUNCTION ensure_default_config()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.configuracion) THEN
    INSERT INTO public.configuracion (
      id,
      nombre_sitio,
      footer_texto1,
      footer_texto2,
      footer_texto3,
      footer_texto4,
      porcentaje_comision
    ) VALUES (
      '1',
      'Sistema de Referidos',
      '© 2025 Sistema de Referidos',
      'Versión: 1.7',
      'Por: Daz The Line',
      'Ver detalles: www.daz.cl',
      10
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para asegurar configuración inicial
DROP TRIGGER IF EXISTS ensure_config_trigger ON public.configuracion;
CREATE TRIGGER ensure_config_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.configuracion
  FOR EACH STATEMENT
  EXECUTE FUNCTION ensure_default_config();