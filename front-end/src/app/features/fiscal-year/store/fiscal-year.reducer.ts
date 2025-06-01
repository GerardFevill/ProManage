import { createReducer, on } from '@ngrx/store';
import { FiscalYearActions } from './fiscal-year.actions';
import { initialFiscalYearState } from './fiscal-year.state';

export const fiscalYearReducer = createReducer(
  initialFiscalYearState,

  // Load Fiscal Years
  on(FiscalYearActions.loadFiscalYears, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(FiscalYearActions.loadFiscalYearsSuccess, (state, { fiscalYears }) => ({
    ...state,
    fiscalYears,
    loading: false,
  })),

  on(FiscalYearActions.loadFiscalYearsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Single Fiscal Year
  on(FiscalYearActions.loadFiscalYear, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(FiscalYearActions.loadFiscalYearSuccess, (state, { fiscalYear }) => ({
    ...state,
    selectedFiscalYear: fiscalYear,
    error: null,
  })),

  on(FiscalYearActions.loadFiscalYearFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(FiscalYearActions.clearSelectedFiscalYear, (state) => ({
    ...state,
    selectedFiscalYear: null,
  })),

  // Create Fiscal Year
  on(FiscalYearActions.createFiscalYear, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(FiscalYearActions.createFiscalYearSuccess, (state, { fiscalYear }) => ({
    ...state,
    fiscalYears: [...state.fiscalYears, fiscalYear],
    loading: false,
  })),

  on(FiscalYearActions.createFiscalYearFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Fiscal Year
  on(FiscalYearActions.updateFiscalYear, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(FiscalYearActions.updateFiscalYearSuccess, (state, { fiscalYear }) => ({
    ...state,
    fiscalYears: state.fiscalYears.map(fy => 
      fy.id === fiscalYear.id ? fiscalYear : fy
    ),
    selectedFiscalYear: fiscalYear,
    loading: false,
  })),

  on(FiscalYearActions.updateFiscalYearFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Fiscal Year
  on(FiscalYearActions.deleteFiscalYear, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(FiscalYearActions.deleteFiscalYearSuccess, (state, { id }) => ({
    ...state,
    fiscalYears: state.fiscalYears.filter(fy => fy.id !== id),
    loading: false,
  })),

  on(FiscalYearActions.deleteFiscalYearFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
