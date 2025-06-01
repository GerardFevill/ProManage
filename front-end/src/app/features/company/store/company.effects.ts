import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, concatMap } from 'rxjs/operators';
import { CompanyService } from '../services/company.service';
import { CompanyActions } from './company.actions';

@Injectable()
export class CompanyEffects {
  readonly loadCompanies$;
  readonly loadCompany$;
  readonly createCompany$;
  readonly updateCompany$;
  readonly deleteCompany$;

  constructor(
    private readonly actions$: Actions,
    private readonly companyService: CompanyService
  ) {
    this.loadCompanies$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CompanyActions.loadCompanies),
        mergeMap(() =>
          this.companyService.getCompanies().pipe(
            map(companies => CompanyActions.loadCompaniesSuccess({ companies })),
            catchError(error => of(CompanyActions.loadCompaniesFailure({ error: error.message })))
          )
        )
      )
    );

    this.loadCompany$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CompanyActions.loadCompany),
        mergeMap(({ id }) =>
          this.companyService.getCompany(id).pipe(
            map(company => CompanyActions.loadCompanySuccess({ company })),
            catchError(error => of(CompanyActions.loadCompanyFailure({ error: error.message })))
          )
        )
      )
    );

    this.createCompany$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CompanyActions.createCompany),
        concatMap(({ company }) =>
          this.companyService.createCompany(company).pipe(
            map(newCompany => CompanyActions.createCompanySuccess({ company: newCompany })),
            catchError(error => of(CompanyActions.createCompanyFailure({ error: error.message })))
          )
        )
      )
    );

    this.updateCompany$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CompanyActions.updateCompany),
        concatMap(({ id, company }) =>
          this.companyService.updateCompany(id, company).pipe(
            map(updatedCompany => CompanyActions.updateCompanySuccess({ company: updatedCompany })),
            catchError(error => of(CompanyActions.updateCompanyFailure({ error: error.message })))
          )
        )
      )
    );

    this.deleteCompany$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CompanyActions.deleteCompany),
        mergeMap(({ id }) =>
          this.companyService.deleteCompany(id).pipe(
            map(() => CompanyActions.deleteCompanySuccess({ id })),
            catchError(error => of(CompanyActions.deleteCompanyFailure({ error: error.message })))
          )
        )
      )
    );
  }
}
