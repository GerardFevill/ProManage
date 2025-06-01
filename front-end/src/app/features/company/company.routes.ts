import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/company-list/company-list.component')
      .then(m => m.CompanyListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/company-form/company-form.component')
      .then(m => m.CompanyFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/company-form/company-form.component')
      .then(m => m.CompanyFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/company-form/company-form.component')
      .then(m => m.CompanyFormComponent)
  },
  {
    path: ':id/fiscal-years',
    children: [
      {
        path: '',
        loadComponent: () => import('../fiscal-year/components/fiscal-year-list/fiscal-year-list.component')
          .then(m => m.FiscalYearListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('../fiscal-year/components/fiscal-year-form/fiscal-year-form.component')
          .then(m => m.FiscalYearFormComponent)
      },
      {
        path: ':fyId',
        loadComponent: () => import('../fiscal-year/components/fiscal-year-form/fiscal-year-form.component')
          .then(m => m.FiscalYearFormComponent)
      },
      {
        path: ':fyId/edit',
        loadComponent: () => import('../fiscal-year/components/fiscal-year-form/fiscal-year-form.component')
          .then(m => m.FiscalYearFormComponent)
      }
    ]
  }
];
