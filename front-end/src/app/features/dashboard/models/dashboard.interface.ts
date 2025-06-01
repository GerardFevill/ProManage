export interface DashboardStats {
  accounting: {
    revenue: Revenue;
    expenses: Expenses;
    profit: Profit;
    treasury: Treasury;
    receivables: Receivables;
    payables: Payables;
    debts: Debts;
    ratios: Ratios;
    accounts: Accounts;
  };
  transactions: Transactions;
  journals: Journals;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface Revenue {
  total: number;
  thisMonth: number;
  lastMonth: number;
  evolution: number;
  monthly: ChartData;
  quarterly: ChartData;
}

export interface Expenses {
  total: number;
  thisMonth: number;
  lastMonth: number;
  evolution: number;
  monthly: ChartData;
  quarterly: ChartData;
}

export interface Profit {
  total: number;
  thisMonth: number;
  lastMonth: number;
  evolution: number;
  monthly: ChartData;
}

export interface Treasury {
  balance: number;
  pending: number;
  overdue: number;
  composition: ChartData;
}

export interface Receivables {
  total: number;
  due30: number;
  due60: number;
  overdue: number;
  aging: ChartData;
}

export interface Payables {
  total: number;
  due30: number;
  due60: number;
  overdue: number;
  aging: ChartData;
}

export interface Debts {
  total: number;
  shortTerm: number;
  longTerm: number;
  ratio: number;
  composition: ChartData;
}

export interface Ratios {
  profitability: number;
  liquidity: number;
  solvency: number;
  debtEquity: number;
}

export interface Accounts {
  assets: {
    total: number;
    current: number;
    fixed: number;
    composition: ChartData;
  };
  liabilities: {
    total: number;
    current: number;
    longTerm: number;
    composition: ChartData;
  };
  equity: {
    total: number;
    capital: number;
    reserves: number;
  };
}

export interface Transactions {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
}

export interface Journals {
  total: number;
  active: number;
  archived: number;
}

export interface BankAccount {
  id: number;
  name: string;
  code: string;
  balance: number;
  description?: string;
  code_pcg_reference: string;
}
