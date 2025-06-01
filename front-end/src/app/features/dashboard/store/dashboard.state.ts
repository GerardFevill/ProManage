import { EntityState } from '@ngrx/entity';
import { BankAccount } from '../models/dashboard.interface';

export interface DashboardState {
  bankAccounts: BankAccount[];
  loading: boolean;
  error: string | null;
}