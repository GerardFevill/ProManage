import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { DashboardActions } from './dashboard.actions';
import { DashboardService } from '../services/dashboard.service';

@Injectable()
export class DashboardEffects {
  readonly loadBankAccounts$;

  constructor(
    private readonly actions$: Actions,
    private readonly dashboardService: DashboardService
  ) {

    this.loadBankAccounts$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DashboardActions.loadBankAccounts),
        mergeMap(({ companyId, fiscalYearId }) =>
          this.dashboardService.getBankAccounts(companyId, fiscalYearId).pipe(
            map((accounts) => DashboardActions.loadBankAccountsSuccess({ accounts })),
            catchError((error) =>
              of(DashboardActions.loadBankAccountsFailure({ error: error.message }))
            )
          )
        )
      )
    );
  }
}
