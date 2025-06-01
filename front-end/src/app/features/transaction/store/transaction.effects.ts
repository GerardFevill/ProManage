import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, concatMap } from 'rxjs/operators';
import { TransactionService } from '../services/transaction.service';
import { TransactionActions } from './transaction.actions';

@Injectable()
export class TransactionEffects {
  readonly loadTransactions$;
  readonly createTransaction$;
  readonly updateTransaction$;
  readonly deleteTransaction$;

  constructor(
    private readonly actions$: Actions,
    private readonly transactionService: TransactionService
  ) {
    this.loadTransactions$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TransactionActions.loadTransactions),
        mergeMap(({ companyId, fiscalYearId }) =>
          this.transactionService.apiGetFilteredTransactions(companyId, fiscalYearId).pipe(
            map(transactions => TransactionActions.loadTransactionsSuccess({ transactions })),
            catchError(error => of(TransactionActions.loadTransactionsFailure({ error: error.message })))
          )
        )
      )
    );

    this.createTransaction$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TransactionActions.createTransaction),
        concatMap(({ transaction }) =>
          this.transactionService.apiCreateTransaction(transaction).pipe(
            map(newTransaction => TransactionActions.createTransactionSuccess({ transaction: newTransaction })),
            catchError(error => of(TransactionActions.createTransactionFailure({ error: error.message })))
          )
        )
      )
    );

    this.updateTransaction$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TransactionActions.updateTransaction),
        concatMap(({ id, transaction }) =>
          this.transactionService.apiUpdateTransaction(id, transaction).pipe(
            map(updatedTransaction => TransactionActions.updateTransactionSuccess({ transaction: updatedTransaction })),
            catchError(error => of(TransactionActions.updateTransactionFailure({ error: error.message })))
          )
        )
      )
    );

    this.deleteTransaction$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TransactionActions.deleteTransaction),
        mergeMap(({ id }) =>
          this.transactionService.apiDeleteTransaction(id).pipe(
            map(() => TransactionActions.deleteTransactionSuccess({ id })),
            catchError(error => of(TransactionActions.deleteTransactionFailure({ error: error.message })))
          )
        )
      )
    );
  }
}
