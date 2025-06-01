import { createReducer, on } from '@ngrx/store';
import { AccountingState, initialAccountingState } from './accounting.state';
import { AccountingActions } from './accounting.actions';

export const accountingReducer = createReducer(
  initialAccountingState,

  // Load Accounts
  on(AccountingActions.loadAccounts, (state): AccountingState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountingActions.loadAccountsSuccess, (state, { accounts }): AccountingState => ({
    ...state,
    accounts,
    loading: false
  })),

  on(AccountingActions.loadAccountsFailure, (state, { error }): AccountingState => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Account
  on(AccountingActions.loadAccount, (state): AccountingState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountingActions.loadAccountSuccess, (state, { account }): AccountingState => ({
    ...state,
    selectedAccount: account,
    loading: false
  })),

  on(AccountingActions.loadAccountFailure, (state, { error }): AccountingState => ({
    ...state,
    loading: false,
    error
  })),

  on(AccountingActions.clearSelectedAccount, (state): AccountingState => ({
    ...state,
    selectedAccount: null
  })),

  // Create Account
  on(AccountingActions.createAccount, (state): AccountingState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountingActions.createAccountSuccess, (state, { account }): AccountingState => ({
    ...state,
    accounts: [...state.accounts, account],
    loading: false
  })),

  on(AccountingActions.createAccountFailure, (state, { error }): AccountingState => ({
    ...state,
    loading: false,
    error
  })),

  // Update Account
  on(AccountingActions.updateAccount, (state): AccountingState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountingActions.updateAccountSuccess, (state, { account }): AccountingState => ({
    ...state,
    accounts: state.accounts.map(a => a.id === account.id ? account : a),
    selectedAccount: account,
    loading: false
  })),

  on(AccountingActions.updateAccountFailure, (state, { error }): AccountingState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Account
  on(AccountingActions.deleteAccount, (state): AccountingState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AccountingActions.deleteAccountSuccess, (state, { id }): AccountingState => ({
    ...state,
    accounts: state.accounts.filter(account => account.id !== id),
    loading: false
  })),

  on(AccountingActions.deleteAccountFailure, (state, { error }): AccountingState => ({
    ...state,
    loading: false,
    error
  }))
);
