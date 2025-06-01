export interface LedgerEntry {
    id: number;
    date: Date;
    account_id: number;
    description: string;
    debit: number;
    credit: number;
    company_id: number;
    fiscal_year_id: number;
    created_at: Date;
    updated_at: Date;
}
