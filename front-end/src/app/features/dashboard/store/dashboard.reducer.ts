import { createReducer, on } from '@ngrx/store';
import { DashboardState } from './dashboard.state';
import { DashboardActions } from './dashboard.actions';

export const initialState: DashboardState = {
  bankAccounts: [],
  loading: false,
  error: null
};

export const dashboardReducer = createReducer(
  initialState,
  
  // Load Bank Accounts
  on(DashboardActions.loadBankAccounts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DashboardActions.loadBankAccountsSuccess, (state, { accounts }) => ({
    ...state,
    bankAccounts: accounts,
    loading: false,
    error: null
  })),
  
  on(DashboardActions.loadBankAccountsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
);
