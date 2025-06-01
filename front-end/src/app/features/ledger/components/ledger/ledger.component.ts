import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { AmountPipe } from '../../../../shared/pipes/amount.pipe';
import { BalancePipe } from '../../../../shared/pipes/balance.pipe';
import { DataTableComponent, DataTableColumn } from '../../../../shared/components/data-table/data-table.component';
import { LedgerService, AccountLedger, LedgerEntry } from '../../services/ledger.service';
import { selectCompanyId, selectFiscalYearId } from '../../../transaction/store/transaction.selectors';
import { selectSelectedFiscalYear } from '../../../fiscal-year/store/fiscal-year.selectors';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AmountPipe, BalancePipe, DataTableComponent],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss']
})
export class LedgerComponent implements OnInit {
  private ledgerService = inject(LedgerService);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  filterForm!: FormGroup;
  ledgers: AccountLedger[] = [];
  selectedAccount?: number;

  columns: DataTableColumn[] = [
    { key: 'date', label: 'Date', pipe: 'date' },
    { key: 'reference', label: 'Référence' },
    { key: 'description', label: 'Description' },
    { key: 'debit', label: 'Débit', pipe: 'amount' },
    { key: 'credit', label: 'Crédit', pipe: 'amount' },
    { key: 'balance', label: 'Solde', pipe: 'amount' }
  ];

  ngOnInit() {
    this.initForm();
    this.updateLedger();

    // S'abonner aux changements du formulaire
    this.filterForm.valueChanges.subscribe(() => {
      this.updateLedger();
    });
  }

  private initForm() {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      accountId: [''],
      companyId: [''],
      fiscalYearId: ['']
    });
  }

  selectAccount(accountId: number) {
    this.selectedAccount = this.selectedAccount === accountId ? undefined : accountId;
  }

  private updateLedger() {
    const filters = this.filterForm.value;
    
    combineLatest([
      this.store.select(selectCompanyId),
      this.store.select(selectFiscalYearId),
      this.store.select(selectSelectedFiscalYear)
    ]).subscribe(([companyId, fiscalYearId, selectedFiscalYear]) => {
      if (companyId && fiscalYearId && selectedFiscalYear) {
        // Si aucune date de début n'est spécifiée dans le filtre, utiliser celle de l'exercice
        const startDate = filters.startDate || selectedFiscalYear.startDate.toISOString().split('T')[0];
        // La date de fin est optionnelle
        const endDate = filters.endDate || undefined;

        this.ledgerService.getLedger({
          ...filters,
          companyId,
          fiscalYearId,
          startDate,
          endDate,
        }).subscribe(
          ledgers => {
            this.ledgers = ledgers;
          }
        );
      }
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  }
}
