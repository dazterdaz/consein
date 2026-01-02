/*
  # Agregar campos faltantes a la tabla socios

  1. Cambios
    - Agregar campos bancarios: titular_cuenta, rut, banco, tipo_cuenta, numero_cuenta
    - Agregar campo pin para acceso al portal
    - Agregar campo link para sitio web del socio
    - Renombrar imagen_local a logo_url para consistencia

  2. Notas
    - Estos campos son necesarios para el registro completo de socios
    - Los campos bancarios son obligatorios para pagos de comisiones
*/

-- Agregar campos bancarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'titular_cuenta'
  ) THEN
    ALTER TABLE socios ADD COLUMN titular_cuenta text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'rut'
  ) THEN
    ALTER TABLE socios ADD COLUMN rut text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'banco'
  ) THEN
    ALTER TABLE socios ADD COLUMN banco text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'tipo_cuenta'
  ) THEN
    ALTER TABLE socios ADD COLUMN tipo_cuenta text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'numero_cuenta'
  ) THEN
    ALTER TABLE socios ADD COLUMN numero_cuenta text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'pin'
  ) THEN
    ALTER TABLE socios ADD COLUMN pin text NOT NULL DEFAULT '000000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'link'
  ) THEN
    ALTER TABLE socios ADD COLUMN link text;
  END IF;
END $$;

-- Renombrar imagen_local a logo_url si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'imagen_local'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'socios' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE socios RENAME COLUMN imagen_local TO logo_url;
  END IF;
END $$;

-- Actualizar defaults para campos existentes si es necesario
ALTER TABLE socios ALTER COLUMN direccion SET NOT NULL;
ALTER TABLE socios ALTER COLUMN direccion SET DEFAULT '';

-- Remover los defaults temporales ahora que la migración está completa
ALTER TABLE socios ALTER COLUMN titular_cuenta DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN rut DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN banco DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN tipo_cuenta DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN numero_cuenta DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN pin DROP DEFAULT;
ALTER TABLE socios ALTER COLUMN direccion DROP DEFAULT;
