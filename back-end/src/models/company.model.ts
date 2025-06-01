import { FiscalYear } from './fiscalYear.model';

export interface Company {
    id: number;
    name: string;
    address: string;
    siret: string;
    phone: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    fiscal_years?: FiscalYear[];
}
