import { Routes } from '@angular/router';

export const FORECAST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/forecast/forecast.component').then(m => m.ForecastComponent)
  }
];
