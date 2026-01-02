/*
  # Update configuracion table policies

  1. Changes
    - Modify the INSERT policy to be more permissive for initial configuration
    - Add explicit SELECT policy for authenticated users
    - Ensure policies work with default configuration creation

  2. Security
    - Maintain admin-only updates
    - Allow public read access
    - Allow initial configuration creation
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Configuración visible para todos" ON configuracion;
DROP POLICY IF EXISTS "Permitir creación inicial de configuración" ON configuracion;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar configuración" ON configuracion;

-- Create new policies
CREATE POLICY "Permitir lectura pública"
ON configuracion
FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir creación inicial"
ON configuracion
FOR INSERT
TO public
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM configuracion
  )
);

CREATE POLICY "Solo administradores pueden actualizar"
ON configuracion
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);