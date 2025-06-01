import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../models/transaction.model';
import { TransactionFilters } from './transaction.state';

export const TransactionActions = createActionGroup({
  source: 'Transaction',
  events: {
    // Load Transactions
    'Load Transactions': props<{ companyId: number; fiscalYearId: number}>(),
    'Load Transactions Success': props<{ transactions: Transaction[] }>(),
    'Load Transactions Failure': props<{ error: string }>(),

    // Create Transaction
    'Create Transaction': props<{ transaction: CreateTransactionDto}>(),
    'Create Transaction Success': props<{ transaction: Transaction }>(),
    'Create Transaction Failure': props<{ error: string }>(),

    // Update Transaction
    'Update Transaction': props<{ id: number; transaction: UpdateTransactionDto }>(),
    'Update Transaction Success': props<{ transaction: Transaction }>(),
    'Update Transaction Failure': props<{ error: string }>(),

    // Delete Transaction
    'Delete Transaction': props<{ id: number }>(),
    'Delete Transaction Success': props<{ id: number }>(),
    'Delete Transaction Failure': props<{ error: string }>(),

    // Select Transaction
    'Select Transaction': props<{ id: number | null }>(),

    // Filters
    'Set Filters': props<TransactionFilters>(),
    'Clear Filters': emptyProps(),

    // Reset
    'Reset State': emptyProps(),
  }
});
