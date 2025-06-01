import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountingState } from './accounting.state';

export const selectAccountingState = createFeatureSelector<AccountingState>('accounting');

export const selectAccounts = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.accounts
);

export const selectSelectedAccount = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.selectedAccount
);

export const selectAccountLoading = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.loading
);

export const selectAccountError = createSelector(
  selectAccountingState,
  (state: AccountingState) => state.error
);
