import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/transaction-list/transaction-list.component').then(
        (m) => m.TransactionListComponent
      )
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/transaction-form/transaction-form.component').then(
        (m) => m.TransactionFormComponent
      )
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/transaction-form/transaction-form.component').then(
        (m) => m.TransactionFormComponent
      )
  }
];
