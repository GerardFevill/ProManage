import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { APP_ROUTES } from './app.routes';

import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { reducers, metaReducers } from './store';
import { CompanyEffects } from './features/company/store/company.effects';
import { AccountingEffects } from './features/accounting/store/accounting.effects';
import { TransactionEffects } from './features/transaction/store/transaction.effects';
import { FiscalYearEffects } from './features/fiscal-year/store/fiscal-year.effects';
import { DashboardEffects } from './features/dashboard/store/dashboard.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(),
    provideStore(reducers, { metaReducers }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideEffects(CompanyEffects, AccountingEffects, TransactionEffects, FiscalYearEffects, DashboardEffects)
  ]
};
