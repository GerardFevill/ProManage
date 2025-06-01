import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, concatMap } from 'rxjs/operators';
import { FiscalYearActions } from './fiscal-year.actions';
import { FiscalYearService } from '../services/fiscal-year.service';
import { Router } from '@angular/router';

@Injectable()
export class FiscalYearEffects {
  readonly loadFiscalYears$;
  readonly loadFiscalYear$;
  readonly createFiscalYear$;
  readonly createFiscalYearSuccess$;
  readonly updateFiscalYear$;
  readonly updateFiscalYearSuccess$;
  readonly deleteFiscalYear$;

  constructor(
    private readonly actions$: Actions,
    private readonly fiscalYearService: FiscalYearService,
    private readonly router: Router
  ) {
    this.loadFiscalYears$ = createEffect(() =>
      this.actions$.pipe(
        ofType(FiscalYearActions.loadFiscalYears),
        mergeMap(({ companyId }) =>
          this.fiscalYearService.getFiscalYears(companyId).pipe(
            map(fiscalYears => FiscalYearActions.loadFiscalYearsSuccess({ fiscalYears })),
            catchError(error => of(FiscalYearActions.loadFiscalYearsFailure({ error: error.message })))
          )
        )
      )
    );

    this.loadFiscalYear$ = createEffect(() =>
      this.actions$.pipe(
        ofType(FiscalYearActions.loadFiscalYear),
        mergeMap(({ id }) =>
          this.fiscalYearService.getFiscalYear(id).pipe(
            map(fiscalYear => FiscalYearActions.loadFiscalYearSuccess({ fiscalYear })),
            catchError(error => of(FiscalYearActions.loadFiscalYearFailure({ error: error.message })))
          )
        )
      )
    );

    this.createFiscalYear$ = createEffect(() =>
      this.actions$.pipe(
        ofType(FiscalYearActions.createFiscalYear),
        concatMap(({ fiscalYear }) =>
          this.fiscalYearService.createFiscalYear(fiscalYear).pipe(
            map(newFiscalYear => FiscalYearActions.createFiscalYearSuccess({ fiscalYear: newFiscalYear })),
            catchError(error => of(FiscalYearActions.createFiscalYearFailure({ error: error.message })))
          )
        )
      )
    );

    this.createFiscalYearSuccess$ = createEffect(
      () => {
        return this.actions$.pipe(
          ofType(FiscalYearActions.createFiscalYearSuccess),
          concatMap(({ fiscalYear }) => {
            this.router.navigate(['/companies', fiscalYear.companyId, 'fiscal-years']);
            return of();
          })
        );
      },
      { dispatch: false }
    );

    this.updateFiscalYear$ = createEffect(() =>
      this.actions$.pipe(
        ofType(FiscalYearActions.updateFiscalYear),
        concatMap(({ fiscalYear }) =>
          this.fiscalYearService.updateFiscalYear(fiscalYear).pipe(
            map(updatedFiscalYear => FiscalYearActions.updateFiscalYearSuccess({ fiscalYear: updatedFiscalYear })),
            catchError(error => of(FiscalYearActions.updateFiscalYearFailure({ error: error.message })))
          )
        )
      )
    );

    this.updateFiscalYearSuccess$ = createEffect(
      () => {
        return this.actions$.pipe(
          ofType(FiscalYearActions.updateFiscalYearSuccess),
          concatMap(({ fiscalYear }) => {
            this.router.navigate(['/companies', fiscalYear.companyId, 'fiscal-years']);
            return of();
          })
        );
      },
      { dispatch: false }
    );

    this.deleteFiscalYear$ = createEffect(() =>
      this.actions$.pipe(
        ofType(FiscalYearActions.deleteFiscalYear),
        mergeMap(({ id }) =>
          this.fiscalYearService.deleteFiscalYear(id).pipe(
            map(() => FiscalYearActions.deleteFiscalYearSuccess({ id })),
            catchError(error => of(FiscalYearActions.deleteFiscalYearFailure({ error: error.message })))
          )
        )
      )
    );
  }
}
