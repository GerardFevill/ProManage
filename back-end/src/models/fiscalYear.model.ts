export interface FiscalYear {
    id: number;
    start_date: Date;
    end_date: Date;
    company_id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    status: 'active' | 'closed' | 'pending';
    notes: string;

}
