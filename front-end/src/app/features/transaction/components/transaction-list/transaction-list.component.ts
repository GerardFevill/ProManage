import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take, combineLatest, map, Observable } from 'rxjs';
import { selectError, selectFilteredTransactions, selectLoading, selectTransactions } from '../../store/transaction.selectors';
import { TransactionActions } from '../../store/transaction.actions';
import { Transaction } from '../../models/transaction.model';
import { TransactionDeleteDialogComponent } from '../transaction-delete-dialog/transaction-delete-dialog.component';
import { DataTableComponent, DataTableAction } from '../../../../shared/components/data-table/data-table.component';
import { AppState } from '../../../../store';
import { Company } from '../../../company/models/company.interface';
import { selectSelectedCompany } from '../../../company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../fiscal-year/store/fiscal-year.selectors';

interface TransactionDisplay {
  id?: number;
  date: Date;
  reference: string;
  description: string;
  debit: number[];
  credit: number[];
  amount: number;
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TransactionDeleteDialogComponent,
    DataTableComponent
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions$: Observable<TransactionDisplay[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  showDeleteDialog = false;
  transactionToDelete?: Transaction;

  tableColumns = [
    { key: 'date', label: 'Date', pipe: 'date' },
    { key: 'reference', label: 'Référence' },
    { key: 'description', label: 'Description' },
    { key: 'debit', label: 'Compte débité' },
    { key: 'credit', label: 'Compte crédité' },
    { key: 'amount', label: 'Montant',pipe: 'amount' }
  ];

  tableActions: DataTableAction[] = [
    {
      label: 'Éditer',
      icon: 'btn-icon bi bi-pencil',
      action: (transaction: Transaction) => this.editTransaction(transaction)
    },
    {
      label: 'Copier',
      icon: 'btn-icon bi bi-files',
      action: (transaction: Transaction) => this.copyTransaction(transaction)
    },
    {
      label: 'Supprimer',
      icon: 'btn-icon delete bi bi-trash',
      action: (transaction: Transaction) => this.deleteTransaction(transaction)
    }
  ];

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.transactions$ = this.store.select(selectTransactions).pipe(
      map((transactions: Transaction[]) => 
        transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          reference: transaction.reference || '',
          description: transaction.description,
          debit: transaction.lines?.filter(line => line.is_debit).map(line => line.account_id) || [],
          credit: transaction.lines?.filter(line => !line.is_debit).map(line => line.account_id) || [],
          amount: transaction.lines?.filter(line => line.is_debit).reduce((sum, line) => sum + (line.amount || 0), 0) || 0
        }))
      )
    );
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    // Charger les transactions quand une compagnie est sélectionnée
    this.store.select(selectSelectedCompany).pipe(
      filter((company): company is NonNullable<Company> => 
        !!company && 
        typeof company.id === 'number' && 
        Array.isArray(company.fiscalYears) && 
        company.fiscalYears.length > 0
      ),
      take(1)
    ).subscribe(company => {
      const activeFiscalYear = company.fiscalYears!.find(fy => fy.status === 'active');
      if (!activeFiscalYear?.id) return;
      if (!company?.id) return;
      this.store.dispatch(TransactionActions.loadTransactions({ 
        companyId: company.id!,
        fiscalYearId: activeFiscalYear.id!,
      }));
    });
  }

  private loadTransactions() {
    const selectedCompany$ = this.store.select(selectSelectedCompany);
    const currentFiscalYear$ = this.store.select(selectSelectedFiscalYear);

    combineLatest([selectedCompany$, currentFiscalYear$]).pipe(
      filter(([company, fiscalYear]) => !!company && !!fiscalYear),
      take(1)
    ).subscribe(([company, fiscalYear]) => {
      this.store.dispatch(TransactionActions.loadTransactions({ 
        companyId: company?.id!,
        fiscalYearId: fiscalYear?.id!
      }));
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  }

  getTransactionDate(): Date {
    return this.transactionToDelete?.date || new Date();
  }

  getTransactionReference(): string {
    return this.transactionToDelete?.reference || '';
  }

  getTransactionAmount(): number {
    return this.transactionToDelete?.lines?.filter(line => line.is_debit)
      .reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
  }

  confirmDelete(transaction: Transaction) {
    this.transactionToDelete = transaction;
    this.showDeleteDialog = true;
  }

  onConfirmDelete() {
    if (this.transactionToDelete?.id) {
      this.store.dispatch(TransactionActions.deleteTransaction({ 
        id: this.transactionToDelete.id 
      }));
      this.onCancelDelete();
    }
  }

  onCancelDelete() {
    this.showDeleteDialog = false;
    this.transactionToDelete = undefined;
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(['edit', transaction.id], { relativeTo: this.route });
  }

  copyTransaction(transaction: Transaction): void {
    const copiedTransaction: Partial<Transaction> = {
      ...transaction,
      id: undefined,
      reference: `Copie de ${transaction.reference}`,
      date: new Date()
    };
    this.router.navigate(['new'], { 
      relativeTo: this.route,
      state: { copiedTransaction }
    });
  }

  deleteTransaction(transaction: Transaction): void {
    this.transactionToDelete = transaction;
    this.showDeleteDialog = true;
  }
}
