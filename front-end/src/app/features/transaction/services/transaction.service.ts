import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Transaction, CreateTransactionDto, UpdateTransactionDto } from '../models/transaction.model';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { TransactionActions } from '../store/transaction.actions';
import { selectTransactions } from '../store/transaction.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;
  private store = inject(Store);
  private lastId = 0;
  private transactions: Transaction[] = [];

  constructor(private http: HttpClient) {
    this.store.select(selectTransactions).subscribe(
      transactions => this.transactions = transactions
    );
    this.generateMockTransactions();
  }

  private generateMockTransactions() {
    if (this.transactions.length > 0) {
      return;
    }

    // Comptes fréquemment utilisés
    const accounts = {
      fournisseurs: 401000,
      clients: 411000,
      achats: 607000,
      ventes: 707000,
      revolut: 512001,
      monabanque: 512002,
      fortuno: 512003,
      shine: 512004,
      caisse: 530000,
      honoraires: 622600,
      tvaDeductible: 445660,
      tvaCollectee: 445710
    };

    const transactionTypes = [
      {
        description: 'Facture fournisseur',
        refPrefix: 'FAC-F',
        debit: accounts.achats,
        credit: accounts.fournisseurs,
        minAmount: 100,
        maxAmount: 5000
      },
      {
        description: 'Paiement fournisseur',
        refPrefix: 'VIR-F',
        debit: accounts.fournisseurs,
        credit: accounts.revolut,
        minAmount: 100,
        maxAmount: 5000
      },
      {
        description: 'Facture client',
        refPrefix: 'FAC-C',
        debit: accounts.clients,
        credit: accounts.ventes,
        minAmount: 500,
        maxAmount: 8000
      },
      {
        description: 'Encaissement client',
        refPrefix: 'ENC-C',
        debit: accounts.monabanque,
        credit: accounts.clients,
        minAmount: 500,
        maxAmount: 8000
      },
      {
        description: 'Honoraires',
        refPrefix: 'HON',
        debit: accounts.honoraires,
        credit: accounts.fournisseurs,
        minAmount: 200,
        maxAmount: 2000
      }
    ];

    const mockTransactions: Transaction[] = [];

    for (let i = 1; i <= 50; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * (type.maxAmount - type.minAmount + 1) + type.minAmount);
      const date = new Date(2025, 0, Math.floor(Math.random() * 31) + 1);

      mockTransactions.push({
        id: i,
        date: date,
        description: type.description,
        reference: `${type.refPrefix}-${String(i).padStart(4, '0')}`,
        company_id: 1,
        fiscal_year_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        lines: [
          {
            id: i * 2 - 1,
            transaction_id: i,
            account_id: type.debit,
            is_debit: true,
            amount: amount,
            description: type.description,
            created_at: new Date()
          },
          {
            id: i * 2,
            transaction_id: i,
            account_id: type.credit,
            is_debit: false,
            amount: amount,
            description: type.description,
            created_at: new Date()
          }
        ]
      });
    }

    this.store.dispatch(TransactionActions.loadTransactionsSuccess({ transactions: mockTransactions }));
  }

  // API methods (for future use)
  apiCreateTransaction(dto: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, dto);
  }

  apiUpdateTransaction(id: number, dto: UpdateTransactionDto): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, dto);
  }

  apiDeleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  apiGetFilteredTransactions(companyId: number, fiscalYearId: number): Observable<Transaction[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        companyId: companyId.toString(),
        fiscalYearId: fiscalYearId.toString()
      }
    }).pipe(
      map(transactions => transactions.map(transaction => ({
        ...transaction,
        debit_account_id: parseInt(transaction.debit_account_id),
        credit_account_id: parseInt(transaction.credit_account_id),
        company_id: parseInt(transaction.company_id),
        fiscal_year_id: parseInt(transaction.fiscal_year_id),
        date: new Date(transaction.date)
      })))
    );
  }

  apiGetTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  apiGetAccountTransactions(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/account/${accountId}`);
  }

  apiGetAccountBalance(accountId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/account/${accountId}/balance`);
  }

  // Public methods (current implementation)
  private validateTransaction(dto: CreateTransactionDto | UpdateTransactionDto): void {
    if (!dto.date) {
      throw new Error('Date is required');
    }
    if (!dto.description) {
      throw new Error('Description is required');
    }
    if (!dto.lines || dto.lines.length === 0) {
      throw new Error('At least one transaction line is required');
    }

    // Validate that debits equal credits
    const totalDebits = dto.lines
      .filter(line => line.is_debit)
      .reduce((sum, line) => sum + line.amount, 0);
    const totalCredits = dto.lines
      .filter(line => !line.is_debit)
      .reduce((sum, line) => sum + line.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Total debits must equal total credits');
    }

    // Validate each line
    dto.lines.forEach(line => {
      if (!line.account_id) {
        throw new Error('Account ID is required for each line');
      }
      if (line.amount <= 0) {
        throw new Error('Amount must be positive for each line');
      }
    });
  }

  createTransaction(dto: CreateTransactionDto): Observable<Transaction> {
    this.validateTransaction(dto);

    const now = new Date();
    const newId = ++this.lastId;
    
    const transaction: Transaction = {
      id: newId,
      ...dto,
      created_at: now,
      updated_at: now,
      lines: dto.lines.map(line => ({
        id: ++this.lastId,
        transaction_id: newId,
        account_id: line.account_id,
        is_debit: line.is_debit,
        amount: line.amount,
        description: line.description,
        created_at: now
      }))
    };

    this.store.dispatch(TransactionActions.createTransactionSuccess({ transaction }));
    return of(transaction);
  }

  updateTransaction(id: number, updates: UpdateTransactionDto): Observable<Transaction> {
    const existingTransaction = this.transactions.find(t => t.id === id);
    
    if (!existingTransaction) {
      throw new Error('Transaction non trouvée');
    }

    this.validateTransaction(updates);

    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...updates,
      updated_at: new Date(),
      lines: updates.lines ? updates.lines.map(line => {
        // Find existing line with the same account_id if it exists
        const existingLine = existingTransaction.lines?.find(l => l.account_id === line.account_id);
        return {
          ...existingLine,
          ...line,
          id: existingLine?.id ?? Math.random(), // Generate a temporary ID if it's a new line
          transaction_id: existingTransaction.id!,
          created_at: existingLine?.created_at ?? new Date()
        };
      }) : existingTransaction.lines
    };

    this.store.dispatch(TransactionActions.updateTransactionSuccess({ transaction: updatedTransaction }));
    return of(updatedTransaction);
  }

  deleteTransaction(id: number): Observable<void> {
    const transaction = this.transactions.find(t => t.id === id);
    
    if (!transaction) {
      throw new Error('Transaction non trouvée');
    }

    this.store.dispatch(TransactionActions.deleteTransactionSuccess({ id }));
    return of(void 0);
  }

  getFilteredTransactions(companyId: number, fiscalYearId: number): Transaction[] {
    return this.transactions.filter(t => 
      t.company_id === companyId && 
      t.fiscal_year_id === fiscalYearId
    );
  }

  getTransactionById(id: number): Transaction | undefined {
    return this.transactions.find(t => t.id === id);
  }

  getAccountTransactions(accountId: number): Transaction[] {
    return this.transactions.filter(transaction => 
      transaction.lines?.some(line => line.account_id === accountId)
    );
  }

  getAccountBalance(accountId: number): number {
    return this.transactions.reduce((balance, transaction) => {
      if (!transaction.lines) return balance;
      
      return balance + transaction.lines.reduce((sum, line) => {
        if (line.account_id !== accountId) return sum;
        return sum + (line.is_debit ? line.amount : -line.amount);
      }, 0);
    }, 0);
  }
}
