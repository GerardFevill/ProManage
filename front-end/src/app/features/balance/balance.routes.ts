import { Routes } from '@angular/router';

export const BALANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/balance/balance.component').then(m => m.BalanceComponent)
  }
];
