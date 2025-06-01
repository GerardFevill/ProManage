export interface TransactionLine {
    id: number;
    transaction_id: number;
    account_id: number;
    is_debit: boolean;
    amount: number;
    description?: string;
    created_at: Date;
}

export interface Transaction {
    id: number;
    date: Date;
    description: string;
    reference?: string;
    company_id: number;
    fiscal_year_id: number;
    is_forecast: boolean;
    created_at: Date;
    updated_at: Date;
    lines?: TransactionLine[];
}
