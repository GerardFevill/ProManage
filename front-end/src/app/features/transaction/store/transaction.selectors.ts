import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionState } from './transaction.state';

export const selectTransactionState = createFeatureSelector<TransactionState>('transaction');

export const selectTransactions = createSelector(
  selectTransactionState,
  (state) => state.transactions
);

export const selectSelectedTransactionId = createSelector(
  selectTransactionState,
  (state) => state.selectedTransactionId
);

export const selectSelectedTransaction = createSelector(
  selectTransactions,
  selectSelectedTransactionId,
  (transactions, selectedId) =>
    selectedId ? transactions.find((t) => t.id === selectedId) : null
);

export const selectTransactionById = (id: number) => createSelector(
  selectTransactions,
  (transactions) => transactions.find((t) => t.id === id)
);

export const selectFilters = createSelector(
  selectTransactionState,
  (state) => state.filters
);

export const selectLoading = createSelector(
  selectTransactionState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectTransactionState,
  (state) => state.error
);

export const selectCompanyId = createSelector(
  selectTransactionState,
  (state) => state.companyId
);

export const selectFiscalYearId = createSelector(
  selectTransactionState,
  (state) => state.fiscalYearId
);

export const selectFilteredTransactions = createSelector(
  selectTransactions,
  selectFilters,
  (transactions, filters) => {
    let filtered = transactions;

    if (filters.startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => new Date(t.date) <= filters.endDate!);
    }

    if (filters.minAmount) {
      filtered = filtered.filter((t) => {
        const totalDebit = t.lines?.filter(line => line.is_debit)
          .reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
        return totalDebit >= filters.minAmount!;
      });
    }

    if (filters.maxAmount) {
      filtered = filtered.filter((t) => {
        const totalDebit = t.lines?.filter(line => line.is_debit)
          .reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
        return totalDebit <= filters.maxAmount!;
      });
    }

    if (filters.accountId) {
      filtered = filtered.filter((t) =>
        t.lines?.some(line => line.account_id === filters.accountId)
      );
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.reference?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
);

export const selectAccountTransactions = (accountId: number) =>
  createSelector(selectTransactions, (transactions) =>
    transactions.filter((t) =>
      t.lines?.some(line => line.account_id === accountId)
    )
  );

export const selectAccountBalance = (accountId: number) =>
  createSelector(selectTransactions, (transactions) =>
    transactions.reduce((balance, transaction) => {
      const debitAmount = transaction.lines
        ?.filter(line => line.account_id === accountId && line.is_debit)
        .reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
      
      const creditAmount = transaction.lines
        ?.filter(line => line.account_id === accountId && !line.is_debit)
        .reduce((sum, line) => sum + (line.amount || 0), 0) || 0;

      return balance + debitAmount - creditAmount;
    }, 0)
  );
