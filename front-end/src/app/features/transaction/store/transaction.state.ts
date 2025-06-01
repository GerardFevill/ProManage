import { Transaction } from '../models/transaction.model';

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  accountId?: number;
  searchTerm?: string;
}

export interface TransactionState {
  transactions: Transaction[];
  selectedTransactionId: number | null;
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  companyId: number | null;
  fiscalYearId: number | null;
}

export const initialTransactionState: TransactionState = {
  transactions: [],
  selectedTransactionId: null,
  filters: {},
  loading: false,
  error: null,
  companyId: null,
  fiscalYearId: null,
};
