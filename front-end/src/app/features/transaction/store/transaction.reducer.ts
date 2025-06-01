import { createFeature, createReducer, on } from '@ngrx/store';
import { TransactionState, initialTransactionState } from './transaction.state';
import { TransactionActions } from './transaction.actions';

export const transactionReducer = createReducer(
  initialTransactionState,

  // Load Transactions
  on(TransactionActions.loadTransactions, (state, { companyId, fiscalYearId }) => ({
    ...state,
    loading: true,
    error: null,
    companyId,
    fiscalYearId
  })),

  on(TransactionActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false,
    error: null
  })),

  on(TransactionActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Transaction
  on(TransactionActions.createTransaction, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TransactionActions.createTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: [...state.transactions, transaction],
    loading: false,
    error: null
  })),

  on(TransactionActions.createTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Transaction
  on(TransactionActions.updateTransaction, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TransactionActions.updateTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: state.transactions.map((t) =>
      t.id === transaction.id ? transaction : t
    ),
    loading: false,
    error: null
  })),

  on(TransactionActions.updateTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Transaction
  on(TransactionActions.deleteTransaction, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TransactionActions.deleteTransactionSuccess, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter((t) => t.id !== id),
    loading: false,
    error: null
  })),

  on(TransactionActions.deleteTransactionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Select Transaction
  on(TransactionActions.selectTransaction, (state, { id }) => ({
    ...state,
    selectedTransactionId: id
  })),

  // Set Filters
  on(TransactionActions.setFilters, (state, filters) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  // Clear Filters
  on(TransactionActions.clearFilters, (state) => ({
    ...state,
    filters: {}
  })),

  // Reset State
  on(TransactionActions.resetState, () => initialTransactionState)
);
