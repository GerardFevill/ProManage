import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { selectSelectedCompany } from '../store/company.selectors';
import { map, take } from 'rxjs/operators';

export const companySelectedGuard: CanActivateFn = () => {
  const store = inject(Store<AppState>);
  const router = inject(Router);

  return store.select(selectSelectedCompany).pipe(
    take(1),
    map(company => {
      if (!company) {
        router.navigate(['/companies']);
        return false;
      }
      return true;
    })
  );
};
