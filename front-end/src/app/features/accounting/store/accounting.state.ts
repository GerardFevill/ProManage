import { Account } from '../models/account.interface';

export interface AccountingState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
}

export const initialAccountingState: AccountingState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
  error: null
};
