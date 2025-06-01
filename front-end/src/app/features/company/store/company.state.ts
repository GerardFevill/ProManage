import { Company } from '../models/company.interface';

export interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
}

export const initialCompanyState: CompanyState = {
  companies: [],
  selectedCompany: null,
  loading: false,
  error: null
};
