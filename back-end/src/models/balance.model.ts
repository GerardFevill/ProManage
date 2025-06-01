export interface Balance {
    id: number;
    company_id: number;
    fiscal_year_id: number;
    date: Date;
    debit: number;
    credit: number;
    balance: number;
    created_at: Date;
    updated_at: Date;
}
