import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, concatMap } from 'rxjs/operators';
import { AccountService } from '../services/account.service';
import { AccountingActions } from './accounting.actions';

@Injectable()
export class AccountingEffects {
  readonly loadAccounts$;
  readonly loadAccount$;
  readonly createAccount$;
  readonly updateAccount$;
  readonly deleteAccount$;

  constructor(
    private readonly actions$: Actions,
    private readonly accountService: AccountService
  ) {
    this.loadAccounts$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AccountingActions.loadAccounts),
        mergeMap((action) =>
          this.accountService.getAccounts().pipe(
            map(accounts => AccountingActions.loadAccountsSuccess({ accounts })),
            catchError(error => of(AccountingActions.loadAccountsFailure({ error: error.message })))
          )
        )
      )
    );

    this.loadAccount$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AccountingActions.loadAccount),
        mergeMap(({ id }) =>
          this.accountService.getAccount(id).pipe(
            map(account => AccountingActions.loadAccountSuccess({ account })),
            catchError(error => of(AccountingActions.loadAccountFailure({ error: error.message })))
          )
        )
      )
    );

    this.createAccount$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AccountingActions.createAccount),
        concatMap(({ account }) =>
          this.accountService.createAccount(account).pipe(
            map(newAccount => AccountingActions.createAccountSuccess({ account: newAccount })),
            catchError(error => of(AccountingActions.createAccountFailure({ error: error.message })))
          )
        )
      )
    );

    this.updateAccount$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AccountingActions.updateAccount),
        concatMap(({ id, account }) =>
          this.accountService.updateAccount(id, account).pipe(
            map(updatedAccount => AccountingActions.updateAccountSuccess({ account: updatedAccount })),
            catchError(error => of(AccountingActions.updateAccountFailure({ error: error.message })))
          )
        )
      )
    );

    this.deleteAccount$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AccountingActions.deleteAccount),
        mergeMap(({ id }) =>
          this.accountService.deleteAccount(id).pipe(
            map(() => AccountingActions.deleteAccountSuccess({ id })),
            catchError(error => of(AccountingActions.deleteAccountFailure({ error: error.message })))
          )
        )
      )
    );
  }
}
