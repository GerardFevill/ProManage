-- Create fiscal_year table
CREATE TABLE IF NOT EXISTS fiscal_year (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fiscal_year_company_id ON fiscal_year(company_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_year_status ON fiscal_year(status);
CREATE INDEX IF NOT EXISTS idx_fiscal_year_dates ON fiscal_year(start_date, end_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_fiscal_year_updated_at
    BEFORE UPDATE ON fiscal_year
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some constraints
ALTER TABLE fiscal_year
ADD CONSTRAINT fiscal_year_dates_check 
CHECK (start_date <= end_date);

-- Add unique constraint to prevent overlapping fiscal years for the same company
ALTER TABLE fiscal_year
ADD CONSTRAINT fiscal_year_no_overlap
EXCLUDE USING gist (
    company_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
);
