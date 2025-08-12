-- ============================================================================
-- EMA - Hash de contraseñas iniciales con pgcrypto (bcrypt)
-- Requiere: extensión pgcrypto
-- Ejecuta sobre las contraseñas insertadas en 19_..._data.sql
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE "User"
SET password = crypt(password, gen_salt('bf'))
WHERE password IS NOT NULL
  AND (char_length(password) < 60 OR password NOT LIKE '$2%');

COMMIT;
