/*
  # Arreglar políticas RLS para permitir operaciones CRUD

  1. Cambios en Políticas
    - Actualizar políticas de artistas, socios, cupones y pagos
    - Permitir a usuarios autenticados realizar operaciones completas
    - Permitir a usuarios públicos crear socios (registro) y cupones
    
  2. Seguridad
    - Mantener restricciones de lectura apropiadas
    - Usuarios no autenticados pueden registrarse como socios
    - Usuarios no autenticados pueden generar cupones
*/

-- ========================================
-- ARTISTAS: Solo usuarios autenticados
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver artistas" ON artistas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear artistas" ON artistas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar artistas" ON artistas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar artistas" ON artistas;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Autenticados pueden ver artistas"
  ON artistas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados pueden insertar artistas"
  ON artistas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar artistas"
  ON artistas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden eliminar artistas"
  ON artistas FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- SOCIOS: Público puede registrarse, autenticados pueden todo
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Cualquiera puede ver socios activos y aprobados" ON socios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver todos los socios" ON socios;
DROP POLICY IF EXISTS "Cualquiera puede registrarse como socio" ON socios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar socios" ON socios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar socios" ON socios;

-- Nuevas políticas
CREATE POLICY "Público puede ver socios activos y aprobados"
  ON socios FOR SELECT
  TO public
  USING (activo = true AND aprobado = true);

CREATE POLICY "Autenticados pueden ver todos los socios"
  ON socios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Público puede registrarse como socio"
  ON socios FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden insertar socios"
  ON socios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar socios"
  ON socios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden eliminar socios"
  ON socios FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- CUPONES: Público puede crear, autenticados pueden todo
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Cualquiera puede crear cupones" ON cupones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver todos los cupones" ON cupones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar cupones" ON cupones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar cupones" ON cupones;

-- Nuevas políticas
CREATE POLICY "Público puede crear cupones"
  ON cupones FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden ver todos los cupones"
  ON cupones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados pueden actualizar cupones"
  ON cupones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden eliminar cupones"
  ON cupones FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- PAGOS: Solo usuarios autenticados
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver todos los pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar pagos" ON pagos;

-- Nuevas políticas
CREATE POLICY "Autenticados pueden ver todos los pagos"
  ON pagos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados pueden crear pagos"
  ON pagos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden actualizar pagos"
  ON pagos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Autenticados pueden eliminar pagos"
  ON pagos FOR DELETE
  TO authenticated
  USING (true);
