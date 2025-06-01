import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DashboardState } from './dashboard.state';
import { BankAccount } from '../models/dashboard.interface';

export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    'Load Bank Accounts': props<{
      companyId: number;
      fiscalYearId: number;
    }>(),
    'Load Bank Accounts Success': props<{
      accounts: BankAccount[];
    }>(),
    'Load Bank Accounts Failure': props<{ error: string }>(),
  },
});
