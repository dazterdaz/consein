/*
  # Cambiar tipo de columna logo_url para almacenar base64

  1. Cambios
    - Cambiar logo_url de text a text sin límite
    - Esto permitirá almacenar imágenes como data URLs base64
    
  2. Notas
    - Las imágenes base64 pueden ser bastante grandes
    - PostgreSQL maneja text sin problema para este propósito
*/

-- Asegurarse de que logo_url pueda almacenar datos base64 largos
-- En PostgreSQL, TEXT ya no tiene límite, pero lo hacemos explícito
ALTER TABLE socios ALTER COLUMN logo_url TYPE text;
