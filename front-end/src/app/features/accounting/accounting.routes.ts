import { Routes } from '@angular/router';

export const ACCOUNTING_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/account-list/account-list.component')
          .then(m => m.AccountListComponent),
        title: 'Plan Comptable'
      },
      {
        path: 'new',
        loadComponent: () => import('./components/account-form/account-form.component')
          .then(m => m.AccountFormComponent),
        title: 'Nouveau Compte'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/account-detail/account-detail.component')
          .then(m => m.AccountDetailComponent),
        title: 'Détails du Compte'
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/account-form/account-form.component')
          .then(m => m.AccountFormComponent),
        title: 'Modifier le Compte'
      }
    ]
  }
];
