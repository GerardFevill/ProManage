import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompanyState } from './company.state';

export const selectCompanyState = createFeatureSelector<CompanyState>('company');

export const selectCompanies = createSelector(
  selectCompanyState,
  (state: CompanyState) => state.companies
);

export const selectSelectedCompany = createSelector(
  selectCompanyState,
  (state: CompanyState) => state.selectedCompany
);

export const selectCompanyLoading = createSelector(
  selectCompanyState,
  (state: CompanyState) => state.loading
);

export const selectCompanyError = createSelector(
  selectCompanyState,
  (state: CompanyState) => state.error
);
