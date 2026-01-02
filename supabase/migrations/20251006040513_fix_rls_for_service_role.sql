/*
  # Arreglar políticas RLS para permitir inserciones desde el backend

  1. Cambios
    - Las políticas RLS actuales solo permiten a usuarios "authenticated"
    - Pero el frontend usa la ANON key, no la authenticated
    - Necesitamos políticas que permitan a anon_key realizar inserciones
    
  2. Solución
    - Mantener RLS activado para seguridad
    - Permitir a public (anon) realizar inserciones básicas
    - Mantener restricciones de lectura
*/

-- ========================================
-- ARTISTAS: Permitir inserciones públicas temporalmente
-- ========================================

DROP POLICY IF EXISTS "Autenticados pueden insertar artistas" ON artistas;

CREATE POLICY "Permitir insertar artistas"
  ON artistas FOR INSERT
  TO public
  WITH CHECK (true);

-- ========================================
-- SOCIOS: Ya tiene política pública
-- ========================================
-- La política "Público puede registrarse como socio" ya existe

-- ========================================
-- Para el admin, necesitamos permitir con service_role
-- Agregar política para service role
-- ========================================

-- Política para permitir todas las operaciones con service role
CREATE POLICY "Service role puede hacer todo en artistas"
  ON artistas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role puede hacer todo en socios"
  ON socios
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role puede hacer todo en cupones"
  ON cupones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role puede hacer todo en pagos"
  ON pagos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
