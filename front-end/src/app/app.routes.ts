import { Routes } from '@angular/router';
import { COMPANY_ROUTES } from './features/company/company.routes';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';
import { companySelectedGuard } from './features/company/guards/company-selected.guard';
import { ACCOUNTING_ROUTES } from './features/accounting/accounting.routes';
import { TRANSACTION_ROUTES } from './features/transaction/transaction.routes';
import { LEDGER_ROUTES } from './features/ledger/ledger.routes';
import { BALANCE_ROUTES } from './features/balance/balance.routes';
import { BILAN_ROUTES } from './features/bilan/bilan.routes';
import { RESULTAT_ROUTES } from './features/resultat/resultat.routes';
import { FORECAST_ROUTES } from './features/forecast/forecast.routes';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [companySelectedGuard],
        children: DASHBOARD_ROUTES
      },
      {
        path: 'companies',
        children: COMPANY_ROUTES
      },
      {
        path: 'accounting',
        canActivate: [companySelectedGuard],
        children: ACCOUNTING_ROUTES
      },
      {
        path: 'transactions',
        canActivate: [companySelectedGuard],
        children: TRANSACTION_ROUTES
      },
      {
        path: 'ledger',
        canActivate: [companySelectedGuard],
        children: LEDGER_ROUTES
      },
      {
        path: 'balance',
        canActivate: [companySelectedGuard],
        children: BALANCE_ROUTES
      },
      {
        path: 'bilan',
        canActivate: [companySelectedGuard],
        children: BILAN_ROUTES
      },
      {
        path: 'resultat',
        canActivate: [companySelectedGuard],
        children: RESULTAT_ROUTES
      },
      {
        path: 'forecast',
        canActivate: [companySelectedGuard],
        children: FORECAST_ROUTES
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
