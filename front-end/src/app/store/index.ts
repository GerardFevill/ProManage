import { isDevMode } from '@angular/core';
import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { CompanyState } from '../features/company/store/company.state';
import { companyReducer } from '../features/company/store/company.reducer';
import { AccountingState } from '../features/accounting/store/accounting.state';
import { accountingReducer } from '../features/accounting/store/accounting.reducer';
import { TransactionState } from '../features/transaction/store/transaction.state';
import { transactionReducer } from '../features/transaction/store/transaction.reducer';
import { FiscalYearState } from '../features/fiscal-year/store/fiscal-year.state';
import { fiscalYearReducer } from '../features/fiscal-year/store/fiscal-year.reducer';
import { DashboardState } from '../features/dashboard/store/dashboard.state';
import { dashboardReducer } from '../features/dashboard/store/dashboard.reducer';

export interface AppState {
  company: CompanyState;
  accounting: AccountingState;
  transaction: TransactionState;
  fiscalYear: FiscalYearState;
  dashboard: DashboardState;
}

export const reducers: ActionReducerMap<AppState> = {
  company: companyReducer,
  accounting: accountingReducer,
  transaction: transactionReducer,
  fiscalYear: fiscalYearReducer,
  dashboard: dashboardReducer
};

export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
