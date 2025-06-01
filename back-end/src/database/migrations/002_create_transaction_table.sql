-- Create transaction table
CREATE TABLE IF NOT EXISTS transaction (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    debit_account_id INTEGER NOT NULL REFERENCES account(id),
    credit_account_id INTEGER NOT NULL REFERENCES account(id),
    description TEXT NOT NULL,
    reference VARCHAR(100),
    company_id INTEGER NOT NULL,
    fiscal_year_id INTEGER NOT NULL,
    is_forecast BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_debit_account FOREIGN KEY (debit_account_id) REFERENCES account(id),
    CONSTRAINT fk_credit_account FOREIGN KEY (credit_account_id) REFERENCES account(id)
);
