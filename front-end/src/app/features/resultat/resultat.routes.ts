import { Routes } from '@angular/router';

export const RESULTAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/resultat/resultat.component').then(m => m.ResultatComponent)
  }
];
