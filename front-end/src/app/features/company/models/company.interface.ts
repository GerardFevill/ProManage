import { FiscalYear } from "../../fiscal-year/models/fiscal-year.interface";

export interface CompanyMetrics {
  revenue?: number;
  profit?: number;
  employees?: number;
  projects?: number;
}

export interface Company {
  id?: number;
  name: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  siret?: string;
  legalForm?: string;
  vatNumber?: string;
  status?: 'active' | 'inactive';
  metrics?: CompanyMetrics;
  fiscalYears?: FiscalYear[];
  createdAt?: Date;
  updatedAt?: Date;
}
