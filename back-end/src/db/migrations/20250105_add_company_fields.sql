-- Add new fields to company table
ALTER TABLE company
ADD COLUMN IF NOT EXISTS siret VARCHAR(14),
ADD COLUMN IF NOT EXISTS legal_form VARCHAR(100),
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50);
