/*
  # Create configuration table

  1. New Tables
    - `configuracion`
      - `id` (text, primary key)
      - `nombre_sitio` (text)
      - `logo_url` (text, nullable)
      - `footer_texto1` (text)
      - `footer_texto2` (text)
      - `footer_texto3` (text)
      - `footer_texto4` (text)
      - `porcentaje_comision` (numeric)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `configuracion` table
    - Add policies for:
      - Anyone can read configuration
      - Only authenticated users with admin role can update configuration
      - Allow initial configuration creation for anonymous users (needed for first-time setup)
*/

-- Create the configuration table
CREATE TABLE IF NOT EXISTS configuracion (
  id text PRIMARY KEY,
  nombre_sitio text NOT NULL,
  logo_url text,
  footer_texto1 text NOT NULL,
  footer_texto2 text NOT NULL,
  footer_texto3 text NOT NULL,
  footer_texto4 text NOT NULL,
  porcentaje_comision numeric NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read configuration
CREATE POLICY "Configuración visible para todos" ON configuracion
  FOR SELECT
  TO public
  USING (true);

-- Allow insert only if no configuration exists (for initial setup)
CREATE POLICY "Permitir creación inicial de configuración" ON configuracion
  FOR INSERT
  TO public
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM configuracion
    )
  );

-- Allow update for authenticated admin users only
CREATE POLICY "Solo administradores pueden actualizar configuración" ON configuracion
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracion_updated_at
    BEFORE UPDATE ON configuracion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();