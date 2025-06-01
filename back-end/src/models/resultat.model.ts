export interface Resultat {
    id: number;
    company_id: number;
    fiscal_year_id: number;
    date: Date;
    revenues: number;
    expenses: number;
    net_income: number;
    created_at: Date;
    updated_at: Date;
}
