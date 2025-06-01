import { createReducer, on } from '@ngrx/store';
import { CompanyState, initialCompanyState } from './company.state';
import { CompanyActions } from './company.actions';

export const companyReducer = createReducer(
  initialCompanyState,

  // Load Companies
  on(CompanyActions.loadCompanies, (state): CompanyState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CompanyActions.loadCompaniesSuccess, (state, { companies }): CompanyState => ({
    ...state,
    companies,
    loading: false
  })),

  on(CompanyActions.loadCompaniesFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Company
  on(CompanyActions.loadCompany, (state): CompanyState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CompanyActions.loadCompanySuccess, (state, { company }): CompanyState => ({
    ...state,
    selectedCompany: company,
    loading: false
  })),

  on(CompanyActions.loadCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error
  })),

  on(CompanyActions.clearSelectedCompany, (state): CompanyState => ({
    ...state,
    selectedCompany: null
  })),

  // Create Company
  on(CompanyActions.createCompany, (state): CompanyState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CompanyActions.createCompanySuccess, (state, { company }): CompanyState => ({
    ...state,
    companies: [...state.companies, company],
    loading: false
  })),

  on(CompanyActions.createCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error
  })),

  // Update Company
  on(CompanyActions.updateCompany, (state): CompanyState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CompanyActions.updateCompanySuccess, (state, { company }): CompanyState => ({
    ...state,
    companies: state.companies.map(c => c.id === company.id ? company : c),
    selectedCompany: company,
    loading: false
  })),

  on(CompanyActions.updateCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Company
  on(CompanyActions.deleteCompany, (state): CompanyState => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CompanyActions.deleteCompanySuccess, (state, { id }): CompanyState => ({
    ...state,
    companies: state.companies.filter(company => company.id !== id),
    loading: false
  })),

  on(CompanyActions.deleteCompanyFailure, (state, { error }): CompanyState => ({
    ...state,
    loading: false,
    error
  }))
);
