export interface Account {
    id: number;
    code: string;
    name: string;
    type_id: number;
    classe_pcg_id: number;
    parent_id?: number;
    description?: string;
    is_active: boolean;
    is_auxiliaire: boolean;
    code_pcg_reference?: string;
    lettrage?: string;
    created_at: Date;
    updated_at: Date;
}

export enum AccountType {
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE'
}

export interface AccountTransaction {
    id: number;
    account_id: number;
    date: Date;
    type: TransactionType;
    amount: number;
    description: string;
    reference: string;
    company_id: number;
    created_at: Date;
    updated_at: Date;
}

export enum TransactionType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT'
}

export interface AccountBalance {
    account_id: number;
    total_debit: number;
    total_credit: number;
    balance: number;
}
