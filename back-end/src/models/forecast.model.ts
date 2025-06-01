export interface Forecast {
    id: number;
    date: Date;
    amount: number;
    description: string;
    company_id: number;
    fiscal_year_id: number;
    is_forecast: boolean;
    created_at: Date;
    updated_at: Date;
}
