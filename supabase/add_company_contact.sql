-- Execute este script no banco PostgreSQL do VPS
-- Via Bitvise SSH: psql -U postgres -d postgres

ALTER TABLE system_settings
    ADD COLUMN IF NOT EXISTS company_name  TEXT,
    ADD COLUMN IF NOT EXISTS company_phone TEXT;

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
  AND column_name IN ('company_name', 'company_phone');
