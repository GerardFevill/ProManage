import { FiscalYear } from '../models/fiscal-year.interface';

export interface FiscalYearState {
  fiscalYears: FiscalYear[];
  selectedFiscalYear: FiscalYear | null;
  loading: boolean;
  error: string | null;
}

export const initialFiscalYearState: FiscalYearState = {
  fiscalYears: [],
  selectedFiscalYear: null,
  loading: false,
  error: null,
};
