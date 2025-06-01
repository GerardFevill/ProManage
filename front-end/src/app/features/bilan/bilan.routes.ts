import { Routes } from '@angular/router';

export const BILAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/bilan/bilan.component').then(m => m.BilanComponent)
  }
];
