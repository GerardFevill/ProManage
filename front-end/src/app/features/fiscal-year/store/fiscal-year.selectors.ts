import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FiscalYearState } from './fiscal-year.state';

export const selectFiscalYearState = createFeatureSelector<FiscalYearState>('fiscalYear');

export const selectFiscalYears = createSelector(
  selectFiscalYearState,
  (state) => state.fiscalYears
);

export const selectSelectedFiscalYear = createSelector(
  selectFiscalYearState,
  (state) => state.selectedFiscalYear
);

export const selectFiscalYearLoading = createSelector(
  selectFiscalYearState,
  (state) => state.loading
);

export const selectFiscalYearError = createSelector(
  selectFiscalYearState,
  (state) => state.error
);
