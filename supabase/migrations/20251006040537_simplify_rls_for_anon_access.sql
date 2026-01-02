/*
  # Simplificar RLS para permitir acceso con anon key

  1. Problema
    - El sistema usa autenticación local (localStorage), NO Supabase Auth
    - Las políticas actuales requieren rol "authenticated" que nunca se cumple
    - Todas las operaciones desde el frontend usan la anon key
    
  2. Solución
    - Permitir a "anon" (público) realizar todas las operaciones
    - Mantener RLS activado para posible migración futura a Supabase Auth
    - En producción, se debe implementar autenticación real
*/

-- ========================================
-- ARTISTAS
-- ========================================

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Autenticados pueden ver artistas" ON artistas;
DROP POLICY IF EXISTS "Autenticados pueden insertar artistas" ON artistas;
DROP POLICY IF EXISTS "Autenticados pueden actualizar artistas" ON artistas;
DROP POLICY IF EXISTS "Autenticados pueden eliminar artistas" ON artistas;
DROP POLICY IF EXISTS "Permitir insertar artistas" ON artistas;
DROP POLICY IF EXISTS "Service role puede hacer todo en artistas" ON artistas;

-- Crear políticas simples que permitan todo a anon
CREATE POLICY "Permitir todo a anon en artistas"
  ON artistas
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- SOCIOS
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Público puede ver socios activos y aprobados" ON socios;
DROP POLICY IF EXISTS "Autenticados pueden ver todos los socios" ON socios;
DROP POLICY IF EXISTS "Público puede registrarse como socio" ON socios;
DROP POLICY IF EXISTS "Autenticados pueden insertar socios" ON socios;
DROP POLICY IF EXISTS "Autenticados pueden actualizar socios" ON socios;
DROP POLICY IF EXISTS "Autenticados pueden eliminar socios" ON socios;
DROP POLICY IF EXISTS "Service role puede hacer todo en socios" ON socios;

-- Crear políticas simples
CREATE POLICY "Permitir todo a anon en socios"
  ON socios
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- CUPONES
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Público puede crear cupones" ON cupones;
DROP POLICY IF EXISTS "Autenticados pueden ver todos los cupones" ON cupones;
DROP POLICY IF EXISTS "Autenticados pueden actualizar cupones" ON cupones;
DROP POLICY IF EXISTS "Autenticados pueden eliminar cupones" ON cupones;
DROP POLICY IF EXISTS "Service role puede hacer todo en cupones" ON cupones;

-- Crear políticas simples
CREATE POLICY "Permitir todo a anon en cupones"
  ON cupones
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- PAGOS
-- ========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Autenticados pueden ver todos los pagos" ON pagos;
DROP POLICY IF EXISTS "Autenticados pueden crear pagos" ON pagos;
DROP POLICY IF EXISTS "Autenticados pueden actualizar pagos" ON pagos;
DROP POLICY IF EXISTS "Autenticados pueden eliminar pagos" ON pagos;
DROP POLICY IF EXISTS "Service role puede hacer todo en pagos" ON pagos;

-- Crear políticas simples
CREATE POLICY "Permitir todo a anon en pagos"
  ON pagos
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
