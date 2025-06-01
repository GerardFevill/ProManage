-- Création des tables pour la comptabilité

-- Table des comptes
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des journaux comptables
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des écritures comptables
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    journal_id INTEGER REFERENCES journals(id),
    date DATE NOT NULL,
    description TEXT,
    reference VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, validated, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes d'écriture
CREATE TABLE entry_lines (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id),
    account_id INTEGER REFERENCES accounts(id),
    debit DECIMAL(15,2) DEFAULT 0.00,
    credit DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des exercices fiscaux
CREATE TABLE fiscal_years (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des factures
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- customer, supplier
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des mouvements de trésorerie
CREATE TABLE treasury_movements (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, validated, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création des index
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_status ON entries(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_treasury_movements_date ON treasury_movements(date);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertion de quelques données de test
INSERT INTO accounts (code, name, type) VALUES
    ('101000', 'Capital social', 'equity'),
    ('512000', 'Banque', 'asset'),
    ('401000', 'Fournisseurs', 'liability'),
    ('411000', 'Clients', 'asset'),
    ('607000', 'Achats de marchandises', 'expense'),
    ('707000', 'Ventes de marchandises', 'revenue');

INSERT INTO journals (name, description) VALUES
    ('ACH', 'Journal des achats'),
    ('VTE', 'Journal des ventes'),
    ('BNQ', 'Journal de banque'),
    ('OD', 'Journal des opérations diverses');
