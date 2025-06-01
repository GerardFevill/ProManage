import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Account } from '../models/account.interface';

export const AccountingActions = createActionGroup({
  source: 'Accounting',
  events: {
    // Load Accounts
    'Load Accounts': emptyProps(),
    'Load Accounts Success': props<{ accounts: Account[] }>(),
    'Load Accounts Failure': props<{ error: string }>(),

    // Load Single Account
    'Load Account': props<{ id: number }>(),
    'Load Account Success': props<{ account: Account }>(),
    'Load Account Failure': props<{ error: string }>(),

    // Clear Selected Account
    'Clear Selected Account': emptyProps(),

    // Create Account
    'Create Account': props<{ account: Account }>(),
    'Create Account Success': props<{ account: Account }>(),
    'Create Account Failure': props<{ error: string }>(),

    // Update Account
    'Update Account': props<{ id: number; account: Account }>(),
    'Update Account Success': props<{ account: Account }>(),
    'Update Account Failure': props<{ error: string }>(),

    // Delete Account
    'Delete Account': props<{ id: number }>(),
    'Delete Account Success': props<{ id: number }>(),
    'Delete Account Failure': props<{ error: string }>(),
  }
});
